<?php

namespace Tests\Feature\LiveStream;

use App\Models\LiveStream;
use App\Models\User;
use App\Services\LiveChat\LiveStreamCommentService;
use App\Settings\LiveChatSettings;
use App\Support\LiveChat\LiveChatRedisKeys;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class LiveCommentHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(LiveChatSettings::class)->fill([
            'enabled' => 1,
            'minIntervalSec' => 2,
            'burstMax' => 1000,
            'burstWindowSec' => 600,
            'bodyMax' => 200,
        ])->save();
    }

    protected function tearDown(): void
    {
        Redis::flushdb();
        parent::tearDown();
    }

    private function liveStream(): LiveStream
    {
        return LiveStream::factory()->create(['status' => 'live']);
    }

    public function test_index_returns_empty_for_a_stream_with_no_comments(): void
    {
        $user = User::factory()->create();
        $stream = $this->liveStream();

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/live/streams/{$stream->id}/live-comments")
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_posted_comments_are_retrievable_in_chronological_order(): void
    {
        // Distinct authors avoid per-user send throttling between rapid posts.
        $stream = $this->liveStream();
        $first = User::factory()->create(['nickname' => 'Bilal']);
        $second = User::factory()->create(['nickname' => 'Ayesha']);
        $third = User::factory()->create(['nickname' => 'Zain']);

        $this->actingAs($first, 'api')->postJson("/api/v1/live/streams/{$stream->id}/live-comments", ['body' => 'First'])->assertCreated();
        $this->actingAs($second, 'api')->postJson("/api/v1/live/streams/{$stream->id}/live-comments", ['body' => 'Second'])->assertCreated();
        $this->actingAs($third, 'api')->postJson("/api/v1/live/streams/{$stream->id}/live-comments", ['body' => 'Third'])->assertCreated();

        $response = $this->actingAs($first, 'api')
            ->getJson("/api/v1/live/streams/{$stream->id}/live-comments")
            ->assertOk();

        $data = $response->json('data');
        $this->assertSame(['First', 'Second', 'Third'], collect($data)->pluck('text')->all());
        $this->assertSame(['Bilal', 'Ayesha', 'Zain'], collect($data)->pluck('name')->all());
        $this->assertNotEmpty($data[0]['id']);
        $this->assertNotEmpty($data[0]['sent_at']);
    }

    public function test_history_is_scoped_per_stream(): void
    {
        $user = User::factory()->create();
        $streamA = $this->liveStream();
        $streamB = $this->liveStream();

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/streams/{$streamA->id}/live-comments", ['body' => 'Only in A'])
            ->assertCreated();

        $response = $this->actingAs($user, 'api')
            ->getJson("/api/v1/live/streams/{$streamB->id}/live-comments")
            ->assertOk();

        $this->assertSame([], $response->json('data'));
    }

    public function test_history_is_capped_at_the_configured_max_length(): void
    {
        $stream = $this->liveStream();
        $service = app(LiveStreamCommentService::class);
        $overflow = LiveChatRedisKeys::LOG_MAX_LENGTH + 5;

        for ($i = 1; $i <= $overflow; $i++) {
            $service->send($stream, $i, "User {$i}", "Message {$i}");
        }

        $history = $service->recent($stream);

        $this->assertCount(LiveChatRedisKeys::LOG_MAX_LENGTH, $history);
        $this->assertSame('Message '.$overflow, end($history)['text']);
        $this->assertSame('Message 6', $history[0]['text']);
    }

    public function test_purge_stream_clears_the_comment_log(): void
    {
        $user = User::factory()->create();
        $stream = $this->liveStream();

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/streams/{$stream->id}/live-comments", ['body' => 'Hello'])
            ->assertCreated();

        $this->assertNotSame(0, Redis::exists(LiveChatRedisKeys::commentLog($stream->id)));

        LiveChatRedisKeys::purgeStream($stream->id);

        $this->assertSame(0, Redis::exists(LiveChatRedisKeys::commentLog($stream->id)));
    }
}
