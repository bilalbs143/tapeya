<?php

namespace Tests\Feature\LiveStream;

use App\Enums\Streaming\StreamOrientationEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\LiveStream;
use App\Models\User;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\Streaming\CreatesTestMatch;
use Tests\TestCase;

class LiveStreamListingTest extends TestCase
{
    use CreatesTestMatch;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemSettingsSeeder::class);
    }

    public function test_index_includes_standalone_and_open_tournament_streams(): void
    {
        $user = User::factory()->create();
        $match = $this->createMatch();
        $match->tournament->update(['tournament_type' => TournamentTypeEnum::OPEN_TOURNAMENT->value]);

        $standalone = LiveStream::factory()->create([
            'title' => 'Tapeya Launch',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $linked = LiveStream::factory()->create([
            'match_id' => $match->id,
            'provider' => 'youtube',
            'streaming_url' => null,
            'status' => 'live',
            'started_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/v1/live/matches')->assertOk();

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($standalone->id));
        $this->assertTrue($ids->contains($linked->id));
    }

    public function test_index_excludes_non_open_tournament_live_streams(): void
    {
        $user = User::factory()->create();
        $match = $this->createMatch();
        $match->tournament->update(['tournament_type' => TournamentTypeEnum::PRIVATE_TOURNAMENT->value]);

        LiveStream::factory()->create([
            'match_id' => $match->id,
            'provider' => 'youtube',
            'streaming_url' => null,
            'status' => 'live',
            'started_at' => now(),
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/v1/live/matches')->assertOk();

        $this->assertCount(0, $response->json('data'));
    }

    public function test_index_excludes_starting_streams(): void
    {
        $user = User::factory()->create();

        LiveStream::factory()->create([
            'title' => 'Going live soon',
            'status' => 'starting',
            'started_at' => now(),
        ]);

        $live = LiveStream::factory()->create([
            'title' => 'On air',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/v1/live/matches')->assertOk();

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($live->id));
        $this->assertCount(1, $ids);
    }

    public function test_show_returns_playback_for_standalone_stream(): void
    {
        $user = User::factory()->create();
        $stream = LiveStream::factory()->create([
            'streaming_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertOk()
            ->assertJsonPath('data.title', $stream->title)
            ->assertJsonPath('data.is_self_serve', false)
            ->assertJsonPath('data.stream.playback.mode', 'iframe')
            ->assertJsonPath('data.stream.playback.embed_id', 'dQw4w9WgXcQ');
    }

    public function test_guest_can_show_live_stream_teaser_for_share_links(): void
    {
        $stream = LiveStream::factory()->create([
            'streaming_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $this->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertOk()
            ->assertJsonPath('data.title', $stream->title)
            ->assertJsonMissingPath('data.streaming_url')
            ->assertJsonMissingPath('data.stream.playback')
            ->assertJsonMissingPath('data.stream.embed_id');
    }

    public function test_bearer_token_on_public_show_returns_playback(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $stream = LiveStream::factory()->create([
            'streaming_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $this->withToken($token)
            ->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertOk()
            ->assertJsonPath('data.stream.playback.mode', 'iframe')
            ->assertJsonPath('data.streaming_url', $stream->streaming_url);
    }

    public function test_guest_cannot_show_idle_stream(): void
    {
        $stream = LiveStream::factory()->create([
            'status' => 'idle',
        ]);

        $this->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertNotFound();
    }

    public function test_guest_cannot_read_live_comments(): void
    {
        $stream = LiveStream::factory()->create(['status' => 'live', 'started_at' => now()]);

        $this->getJson("/api/v1/live/streams/{$stream->id}/live-comments")
            ->assertUnauthorized();
    }

    public function test_guest_cannot_post_live_comments(): void
    {
        $stream = LiveStream::factory()->create(['status' => 'live', 'started_at' => now()]);

        $this->postJson("/api/v1/live/streams/{$stream->id}/live-comments", ['body' => 'Nope'])
            ->assertUnauthorized();
    }

    public function test_show_marks_self_serve_streams(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $stream = LiveStream::factory()->create([
            'owner_user_id' => $owner->id,
            'status' => 'live',
            'started_at' => now(),
            'streaming_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ]);

        $this->actingAs($viewer, 'api')
            ->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertOk()
            ->assertJsonPath('data.is_self_serve', true)
            ->assertJsonPath('data.orientation', 'portrait')
            ->assertJsonPath('data.broadcaster.id', $owner->id);
    }

    public function test_show_exposes_landscape_orientation_for_self_serve_streams(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $stream = LiveStream::factory()->create([
            'owner_user_id' => $owner->id,
            'orientation' => StreamOrientationEnum::Landscape,
            'status' => 'live',
            'started_at' => now(),
            'streaming_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ]);

        $this->actingAs($viewer, 'api')
            ->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertOk()
            ->assertJsonPath('data.orientation', 'landscape');
    }

    public function test_comment_on_standalone_stream(): void
    {
        $user = User::factory()->create();
        $stream = LiveStream::factory()->create(['status' => 'live', 'started_at' => now()]);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/streams/{$stream->id}/live-comments", ['body' => 'Hello Tapeya!'])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id']]);
    }
}
