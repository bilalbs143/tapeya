<?php

namespace Tests\Feature\Admin;

use App\Enums\User\UserTypeEnum;
use App\Models\User;
use App\Streaming\StreamProviderManager;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\Streaming\CreatesTestMatch;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

/**
 * Regression coverage for the existing match-linked stream lifecycle after the
 * MatchStreamService -> LiveStreamService rename/refactor (Phase 1).
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
    }

    private function admin(): User
    {
        return User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
    }

    public function test_create_stream_for_match(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream")
            ->assertCreated();

        $this->assertDatabaseHas('live_streams', [
            'match_id' => $match->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
        ]);
    }

    public function test_create_stream_persists_streaming_url_when_supplied(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream", [
                'streaming_url' => 'https://www.youtube.com/watch?v=abc123',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('live_streams', [
            'match_id' => $match->id,
            'streaming_url' => 'https://www.youtube.com/watch?v=abc123',
        ]);
    }

    public function test_end_stream_for_match(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();

        $this->actingAs($admin, 'api')->postJson("/api/v1/admin/matches/{$match->id}/stream")->assertCreated();

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

        $this->actingAs($admin, 'api')->postJson("/api/v1/admin/matches/{$match->id}/stream")->assertCreated();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/matches/{$match->id}/stream/sync")
            ->assertOk()
            ->assertJsonPath('data.status', 'live');
    }

    public function test_destroy_stream_for_match(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();

        $this->actingAs($admin, 'api')->postJson("/api/v1/admin/matches/{$match->id}/stream")->assertCreated();

        $this->actingAs($admin, 'api')
            ->deleteJson("/api/v1/admin/matches/{$match->id}/stream")
            ->assertNoContent();

        $this->assertDatabaseMissing('live_streams', ['match_id' => $match->id]);
    }
}
