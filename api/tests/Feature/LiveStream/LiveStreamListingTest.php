<?php

namespace Tests\Feature\LiveStream;

use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\MatchStream;
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

        $standalone = MatchStream::factory()->create([
            'title' => 'Tapeya Launch',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $linked = MatchStream::factory()->create([
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

    public function test_index_excludes_non_open_tournament_match_streams(): void
    {
        $user = User::factory()->create();
        $match = $this->createMatch();
        $match->tournament->update(['tournament_type' => TournamentTypeEnum::LEAGUE->value]);

        MatchStream::factory()->create([
            'match_id' => $match->id,
            'provider' => 'youtube',
            'streaming_url' => null,
            'status' => 'live',
            'started_at' => now(),
        ]);

        $response = $this->actingAs($user, 'api')->getJson('/api/v1/live/matches')->assertOk();

        $this->assertCount(0, $response->json('data'));
    }

    public function test_show_returns_playback_for_standalone_stream(): void
    {
        $user = User::factory()->create();
        $stream = MatchStream::factory()->create([
            'streaming_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'status' => 'live',
            'started_at' => now(),
        ]);

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/live/streams/{$stream->id}")
            ->assertOk()
            ->assertJsonPath('data.title', $stream->title)
            ->assertJsonPath('data.stream.playback.mode', 'iframe')
            ->assertJsonPath('data.stream.playback.embed_id', 'dQw4w9WgXcQ');
    }

    public function test_comment_on_standalone_stream(): void
    {
        $user = User::factory()->create();
        $stream = MatchStream::factory()->create(['status' => 'live', 'started_at' => now()]);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/streams/{$stream->id}/live-comments", ['body' => 'Hello Tapeya!'])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id']]);
    }
}
