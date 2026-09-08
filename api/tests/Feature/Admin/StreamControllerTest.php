<?php

namespace Tests\Feature\Admin;

use App\Enums\User\UserTypeEnum;
use App\Jobs\FinalizeEndedBroadcastJob;
use App\Models\PushNotificationLog;
use App\Models\User;
use App\Models\YoutubeStreamKey;
use App\Services\Push\PushNotificationService;
use App\Streaming\StreamProviderManager;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Crypt;
use Mockery;
use Tests\Support\Streaming\CreatesTestMatch;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

/**
 * Regression coverage for the existing match-linked stream lifecycle.
 */
class StreamControllerTest extends TestCase
{
    use CreatesTestMatch;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);
        $this->app->make(StreamProviderManager::class)->extend('youtube', fn () => new FakeStreamProvider);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('notifyLiveStreamCreated')->andReturn(Mockery::mock(PushNotificationLog::class))->byDefault();
        $this->app->instance(PushNotificationService::class, $push);
    }

    private function admin(): User
    {
        return User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
    }

    private function youtubeKey(User $admin): YoutubeStreamKey
    {
        return YoutubeStreamKey::create([
            'title' => 'Test Rig',
            'youtube_stream_id' => 'fake-yt-stream-'.uniqid(),
            'ingest_rtmp_url' => 'rtmp://a.rtmp.youtube.com/live2',
            'stream_key_encrypted' => Crypt::encryptString('fake-stream-key'),
            'is_active' => true,
            'created_by' => $admin->id,
        ]);
    }

    public function test_create_stream_for_match(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();

        $this->assertDatabaseHas('live_streams', [
            'match_id' => $match->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
            'youtube_stream_key_id' => $key->id,
        ]);
    }

    public function test_create_stream_persists_streaming_url_when_supplied(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", [
                'streaming_url' => 'https://www.youtube.com/watch?v=abc123',
                'youtube_stream_key_id' => $key->id,
            ])
            ->assertCreated();

        $this->assertDatabaseHas('live_streams', [
            'match_id' => $match->id,
            'streaming_url' => 'https://www.youtube.com/watch?v=abc123',
        ]);
    }

    public function test_create_stream_requires_youtube_stream_key_id(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('youtube_stream_key_id');
    }

    public function test_create_stream_rejects_key_in_use_by_another_stream(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $otherMatch = $this->createMatch();
        $key = $this->youtubeKey($admin);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$otherMatch->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();

        // Idle setup still reserves the key — another match cannot bind it until this session ends.
        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('youtube_stream_key_id');
    }

    public function test_end_stream_for_match(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream/end")
            ->assertOk()
            ->assertJsonPath('data.status', 'ended');

        $this->assertDatabaseHas('live_streams', ['match_id' => $match->id, 'status' => 'ended']);
    }

    public function test_sync_stream_for_match(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream/sync")
            ->assertOk()
            ->assertJsonPath('data.status', 'live');
    }

    public function test_destroy_stream_for_match(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();

        $this->actingAs($admin, 'api')
            ->deleteJson("/api/v1/admin/matches/{$match->id}/stream")
            ->assertNoContent();

        $this->assertDatabaseMissing('live_streams', ['match_id' => $match->id]);
    }

    public function test_replace_stream_can_reuse_its_own_key(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();

        // FakeStreamProvider marks the stream 'idle' (not live), so replace is allowed —
        // and the match's own current key must not be rejected as "in use by itself".
        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();
    }

    public function test_sync_auto_end_dispatches_finalize_job(): void
    {
        Bus::fake([FinalizeEndedBroadcastJob::class]);

        $admin = $this->admin();
        $match = $this->createMatch();
        $key = $this->youtubeKey($admin);
        $fake = new FakeStreamProvider;
        $this->app->make(StreamProviderManager::class)->extend('youtube', fn () => $fake);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", ['youtube_stream_key_id' => $key->id])
            ->assertCreated();

        $fake->syncToStatus = 'ended';

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream/sync")
            ->assertOk()
            ->assertJsonPath('data.status', 'ended');

        Bus::assertDispatched(FinalizeEndedBroadcastJob::class, function (FinalizeEndedBroadcastJob $job) use ($match) {
            return $job->streamId === $match->fresh()->stream?->id && $job->notifyClients === false;
        });
    }
}
