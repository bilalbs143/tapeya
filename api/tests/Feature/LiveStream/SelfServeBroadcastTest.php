<?php

namespace Tests\Feature\LiveStream;

use App\Models\MatchStream;
use App\Models\User;
use App\Settings\StreamingSettings;
use App\Streaming\StreamProviderManager;
use Carbon\Carbon;
use Database\Seeders\SystemSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

/**
 * Self-serve mobile broadcast lifecycle — LiveBroadcastController (Phase 1 backend,
 * LIVE_STREAM_MOBILE_BROADCAST.md). Native plugin / RTMP publish is out of scope here;
 * this covers everything up to and including handing back ingest credentials.
 */
class SelfServeBroadcastTest extends TestCase
{
    use RefreshDatabase;

    private FakeStreamProvider $fakeProvider;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SystemSettingsSeeder::class);

        $fakeProvider = new FakeStreamProvider;
        $this->fakeProvider = $fakeProvider;
        // Explicit use() capture of a local variable, not fn () => $this->fakeProvider — Laravel's
        // Manager::callCustomCreator() does not reliably preserve $this through the stored closure.
        $this->app->make(StreamProviderManager::class)->extend('youtube', function () use ($fakeProvider) {
            return $fakeProvider;
        });
    }

    private function eligibleUser(): User
    {
        return User::factory()->create([
            'type' => 'user',
            'can_broadcast' => true,
            'broadcast_terms_accepted_at' => now(),
        ]);
    }

    public function test_store_rejected_for_ineligible_user(): void
    {
        $user = User::factory()->create(['type' => 'user', 'can_broadcast' => false]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'My Broadcast'])
            ->assertForbidden();
    }

    public function test_store_rejected_when_terms_not_accepted(): void
    {
        $user = User::factory()->create([
            'type' => 'user',
            'can_broadcast' => true,
            'broadcast_terms_accepted_at' => null,
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'My Broadcast'])
            ->assertForbidden();
    }

    public function test_accept_terms_unblocks_store(): void
    {
        $user = User::factory()->create(['type' => 'user', 'can_broadcast' => true, 'broadcast_terms_accepted_at' => null]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts/accept-terms')
            ->assertOk();

        $this->assertNotNull($user->fresh()->broadcast_terms_accepted_at);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'My Broadcast'])
            ->assertCreated();
    }

    public function test_store_creates_self_serve_stream_and_returns_ingest_credentials(): void
    {
        $user = $this->eligibleUser();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', [
                'title' => 'Tapeya Launch Event',
                'description' => 'Product demo',
            ])
            ->assertCreated();

        $streamId = $response->json('data.stream_id');
        $this->assertNotNull($streamId);
        $this->assertNotNull($response->json('data.rtmp_url'));
        $this->assertNotNull($response->json('data.stream_key'));

        $this->assertDatabaseHas('match_streams', [
            'id' => $streamId,
            'match_id' => null,
            'owner_user_id' => $user->id,
            'provider' => 'youtube',
            'title' => 'Tapeya Launch Event',
        ]);

        // Never public — see "Ingest & playback provider" in the design doc.
        $this->assertSame('unlisted', $this->fakeProvider->lastCreateData->privacy);
    }

    public function test_second_concurrent_broadcast_rejected(): void
    {
        $user = $this->eligibleUser();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'First'])
            ->assertCreated();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Second'])
            ->assertUnprocessable();
    }

    public function test_create_fails_closed_when_default_provider_is_not_youtube(): void
    {
        app(StreamingSettings::class)->fill(['defaultProvider' => 'external'])->save();

        $user = $this->eligibleUser();

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'My Broadcast'])
            ->assertStatus(503);
    }

    public function test_show_rejected_for_non_owner(): void
    {
        $owner = $this->eligibleUser();
        $other = $this->eligibleUser();

        $streamId = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $this->actingAs($other, 'api')
            ->getJson("/api/v1/live/broadcasts/{$streamId}")
            ->assertForbidden();
    }

    public function test_show_rejected_after_can_broadcast_revoked(): void
    {
        $user = $this->eligibleUser();

        $streamId = $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $user->update(['can_broadcast' => false]);

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/live/broadcasts/{$streamId}")
            ->assertForbidden();
    }

    public function test_show_returns_410_once_ended(): void
    {
        $user = $this->eligibleUser();

        $streamId = $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $this->actingAs($user, 'api')->postJson("/api/v1/live/broadcasts/{$streamId}/end")->assertOk();

        $this->actingAs($user, 'api')
            ->getJson("/api/v1/live/broadcasts/{$streamId}")
            ->assertStatus(410);
    }

    public function test_end_rejected_for_non_owner(): void
    {
        $owner = $this->eligibleUser();
        $other = $this->eligibleUser();

        $streamId = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $this->actingAs($other, 'api')
            ->postJson("/api/v1/live/broadcasts/{$streamId}/end")
            ->assertForbidden();

        $this->assertDatabaseHas('match_streams', ['id' => $streamId, 'status' => 'idle']);
    }

    public function test_start_marks_idle_stream_live_for_hub_and_chat(): void
    {
        $user = $this->eligibleUser();

        $streamId = $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/broadcasts/{$streamId}/start")
            ->assertOk()
            ->assertJsonPath('data.status', 'live');

        $stream = MatchStream::find($streamId);
        $this->assertSame('live', $stream->status);
        $this->assertNotNull($stream->started_at);
        $this->assertNotNull($stream->provider_metadata['owner_publishing_since'] ?? null);

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/streams/{$streamId}/live-comments", ['body' => 'Hello from broadcaster'])
            ->assertCreated();
    }

    public function test_start_rejected_for_non_owner(): void
    {
        $owner = $this->eligibleUser();
        $other = $this->eligibleUser();

        $streamId = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $this->actingAs($other, 'api')
            ->postJson("/api/v1/live/broadcasts/{$streamId}/start")
            ->assertForbidden();
    }

    public function test_thumbnail_upload_and_delete_owner_only(): void
    {
        $owner = $this->eligibleUser();
        $other = $this->eligibleUser();

        $streamId = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $file = UploadedFile::fake()->image('thumb.jpg', 360, 185);

        $this->actingAs($other, 'api')
            ->post("/api/v1/live/broadcasts/{$streamId}/thumbnail", ['file' => $file])
            ->assertForbidden();

        $this->actingAs($owner, 'api')
            ->post("/api/v1/live/broadcasts/{$streamId}/thumbnail", ['file' => $file])
            ->assertOk();

        $stream = MatchStream::find($streamId);
        $this->assertNotNull($stream->getRawOriginal('stream_thumbnail'));

        $this->actingAs($owner, 'api')
            ->delete("/api/v1/live/broadcasts/{$streamId}/thumbnail")
            ->assertNoContent();

        $this->assertNull($stream->fresh()->getRawOriginal('stream_thumbnail'));
    }

    public function test_start_while_already_live_refreshes_owner_publishing_grace(): void
    {
        $user = $this->eligibleUser();

        $streamId = $this->actingAs($user, 'api')
            ->postJson('/api/v1/live/broadcasts', ['title' => 'Mine'])
            ->json('data.stream_id');

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/broadcasts/{$streamId}/start")
            ->assertOk();

        $stream = MatchStream::findOrFail($streamId);
        $stream->update([
            'provider_metadata' => array_merge($stream->provider_metadata ?? [], [
                'owner_publishing_since' => now()->subMinutes(4)->toIso8601String(),
            ]),
        ]);

        $before = $stream->fresh()->provider_metadata['owner_publishing_since'];

        $this->actingAs($user, 'api')
            ->postJson("/api/v1/live/broadcasts/{$streamId}/start")
            ->assertOk()
            ->assertJsonPath('data.status', 'live');

        $after = $stream->fresh()->provider_metadata['owner_publishing_since'];
        $this->assertNotSame($before, $after);
        $this->assertTrue(Carbon::parse($after)->greaterThan(Carbon::parse($before)));
    }
}
