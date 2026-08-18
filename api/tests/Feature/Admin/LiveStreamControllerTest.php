<?php

namespace Tests\Feature\Admin;

use App\Enums\User\UserTypeEnum;
use App\Models\MatchStream;
use App\Models\User;
use App\Streaming\StreamProviderManager;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\Streaming\CreatesTestMatch;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

class LiveStreamControllerTest extends TestCase
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

    public function test_store_creates_standalone_stream_with_streaming_url(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'title' => 'Tapeya Launch Event',
            'description' => 'Product demo & Q&A',
            'streaming_url' => 'https://www.youtube.com/watch?v=abc123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.stream.provider', 'external')
            ->assertJsonPath('data.stream.status', 'idle')
            ->assertJsonPath('data.stream.match_id', null);

        $this->assertDatabaseHas('live_streams', [
            'title' => 'Tapeya Launch Event',
            'match_id' => null,
            'provider' => 'external',
            'provider_stream_id' => null,
        ]);
    }

    public function test_store_creates_standalone_youtube_stream_with_ingest(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'provider' => 'youtube',
            'title' => 'Tapeya Studio Show',
            'description' => 'Weekly cricket talk',
            'privacy' => 'unlisted',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.stream.provider', 'youtube')
            ->assertJsonPath('data.stream.match_id', null)
            ->assertJsonPath('data.stream.provider_stream_id', 'fake-broadcast-id')
            ->assertJsonPath('data.ingest.rtmp_url', 'rtmp://fake.example.com/live')
            ->assertJsonPath('data.ingest.stream_key', 'fake-key');

        $this->assertDatabaseHas('live_streams', [
            'title' => 'Tapeya Studio Show',
            'match_id' => null,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
        ]);
    }

    public function test_setup_replaces_youtube_credentials_on_standalone_stream(): void
    {
        $admin = $this->admin();

        $create = $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'provider' => 'youtube',
            'title' => 'First Setup',
        ])->assertCreated();

        $streamId = $create->json('data.stream.id');

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$streamId}/setup", [
                'title' => 'Refreshed Setup',
                'privacy' => 'public',
            ])
            ->assertOk()
            ->assertJsonPath('data.stream.title', 'Refreshed Setup')
            ->assertJsonPath('data.ingest.stream_key', 'fake-key');
    }

    public function test_setup_rejects_match_linked_stream(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();
        $stream = MatchStream::factory()->create([
            'match_id' => $match->id,
            'provider' => 'youtube',
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$stream->id}/setup")
            ->assertUnprocessable();
    }

    public function test_store_requires_title(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'streaming_url' => 'https://example.com/watch',
        ])->assertUnprocessable();
    }

    public function test_store_rejects_non_https_streaming_url(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'api')->postJson('/api/v1/admin/live-streams', [
            'title' => 'Event',
            'streaming_url' => 'http://example.com/watch',
        ])->assertUnprocessable();
    }

    public function test_index_lists_standalone_and_match_linked_streams(): void
    {
        $admin = $this->admin();
        $match = $this->createMatch();

        $standalone = MatchStream::factory()->create(['title' => 'Standalone Event']);
        $linked = MatchStream::factory()->create([
            'match_id' => $match->id,
            'provider' => 'youtube',
            'title' => null,
        ]);

        $response = $this->actingAs($admin, 'api')->getJson('/api/v1/admin/live-streams')->assertOk();

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($standalone->id));
        $this->assertTrue($ids->contains($linked->id));

        $row = collect($response->json('data'))->firstWhere('id', $standalone->id);
        $this->assertArrayHasKey('watching_count', $row);
        $this->assertSame(0, $row['watching_count']);
    }

    public function test_show_includes_monitoring_fields_for_admin_detail(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create();
        $stream = MatchStream::factory()->create([
            'owner_user_id' => $owner->id,
            'status' => 'live',
            'provider' => 'youtube',
            'provider_playback_id' => 'abc123XYZ01',
            'embed_url' => 'https://www.youtube.com/embed/abc123XYZ01',
        ]);

        $response = $this->actingAs($admin, 'api')
            ->getJson("/api/v1/admin/live-streams/{$stream->id}")
            ->assertOk();

        $data = $response->json('data');
        $this->assertSame($owner->id, $data['stream']['owner_user_id']);
        $this->assertArrayHasKey('watching_count', $data);
        $this->assertSame($owner->id, $data['owner']['id']);
        $this->assertNotNull($data['playback']);
        $this->assertSame('iframe', $data['playback']['mode']);
        $this->assertNotEmpty($data['playback']['embed_url'] ?? null);
    }

    public function test_update_updates_title_description_streaming_url(): void
    {
        $admin = $this->admin();
        $stream = MatchStream::factory()->create();

        $this->actingAs($admin, 'api')->patchJson("/api/v1/admin/live-streams/{$stream->id}", [
            'title' => 'Updated Title',
            'description' => 'Updated description',
            'streaming_url' => 'https://example.com/updated.m3u8',
        ])->assertOk();

        $this->assertDatabaseHas('live_streams', [
            'id' => $stream->id,
            'title' => 'Updated Title',
            'description' => 'Updated description',
            'streaming_url' => 'https://example.com/updated.m3u8',
        ]);
    }

    public function test_start_marks_external_stream_live(): void
    {
        $admin = $this->admin();
        $stream = MatchStream::factory()->create(['status' => 'idle']);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$stream->id}/start")
            ->assertOk()
            ->assertJsonPath('data.status', 'live');

        $stream->refresh();
        $this->assertSame('live', $stream->status);
        $this->assertNotNull($stream->started_at);
    }

    public function test_start_rejects_non_external_provider(): void
    {
        $admin = $this->admin();
        $stream = MatchStream::factory()->create(['provider' => 'youtube']);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$stream->id}/start")
            ->assertUnprocessable();
    }

    public function test_end_marks_external_stream_ended_without_provider_call(): void
    {
        $admin = $this->admin();
        $stream = MatchStream::factory()->create(['status' => 'live', 'started_at' => now()]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$stream->id}/end")
            ->assertOk()
            ->assertJsonPath('data.status', 'ended');

        $stream->refresh();
        $this->assertSame('ended', $stream->status);
        $this->assertNotNull($stream->ended_at);
    }

    public function test_sync_is_noop_for_external_provider(): void
    {
        $admin = $this->admin();
        $stream = MatchStream::factory()->create(['status' => 'starting']);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/live-streams/{$stream->id}/sync")
            ->assertOk()
            ->assertJsonPath('data.status', 'starting');
    }

    public function test_destroy_deletes_standalone_stream(): void
    {
        $admin = $this->admin();
        $stream = MatchStream::factory()->create();

        $this->actingAs($admin, 'api')
            ->deleteJson("/api/v1/admin/live-streams/{$stream->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('live_streams', ['id' => $stream->id]);
    }

    public function test_partial_unique_index_enforces_one_stream_per_match(): void
    {
        $match = $this->createMatch();

        MatchStream::factory()->create(['match_id' => $match->id, 'provider' => 'youtube']);

        $this->expectException(QueryException::class);

        MatchStream::factory()->create(['match_id' => $match->id, 'provider' => 'youtube']);
    }
}
