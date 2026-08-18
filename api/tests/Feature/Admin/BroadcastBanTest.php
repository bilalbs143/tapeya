<?php

namespace Tests\Feature\Admin;

use App\Enums\User\UserTypeEnum;
use App\Models\LiveStream;
use App\Models\User;
use App\Streaming\StreamProviderManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\Streaming\FakeStreamProvider;
use Tests\TestCase;

class BroadcastBanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $fake = new FakeStreamProvider;
        // Explicit use() capture of a local variable, not fn () => $this->fake — Laravel's
        // Manager::callCustomCreator() does not reliably preserve $this through the stored closure.
        $this->app->make(StreamProviderManager::class)->extend('youtube', function () use ($fake) {
            return $fake;
        });
    }

    public function test_ban_revokes_access_and_ends_every_active_stream_without_deleting_recording(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $broadcaster = User::factory()->create(['type' => 'user', 'can_broadcast' => true]);

        $active = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $broadcaster->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
            'status' => 'live',
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/users/{$broadcaster->id}/broadcast-ban")
            ->assertOk()
            ->assertJsonPath('data.can_broadcast', false)
            ->assertJsonPath('data.ended_streams', 1);

        $this->assertFalse($broadcaster->fresh()->can_broadcast);
        $this->assertSame('ended', $active->fresh()->status);
        $this->assertSame('fake-broadcast-id', $active->fresh()->provider_stream_id);
    }

    public function test_ban_deletes_idle_never_live_stream_instead_of_ending_it(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $broadcaster = User::factory()->create(['type' => 'user', 'can_broadcast' => true]);

        $idle = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $broadcaster->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
            'status' => 'idle',
            'started_at' => null,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/users/{$broadcaster->id}/broadcast-ban")
            ->assertOk()
            ->assertJsonPath('data.ended_streams', 1);

        // Deleted outright, not ended — stream never went live (orphan draft cleanup).
        $this->assertModelMissing($idle);
    }

    public function test_ban_with_no_active_streams_still_revokes_access(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $broadcaster = User::factory()->create(['type' => 'user', 'can_broadcast' => true]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/users/{$broadcaster->id}/broadcast-ban")
            ->assertOk()
            ->assertJsonPath('data.ended_streams', 0);

        $this->assertFalse($broadcaster->fresh()->can_broadcast);
    }

    public function test_clearing_can_broadcast_via_user_update_ends_active_streams(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $broadcaster = User::factory()->create(['type' => 'user', 'can_broadcast' => true]);

        $active = LiveStream::factory()->create([
            'match_id' => null,
            'owner_user_id' => $broadcaster->id,
            'provider' => 'youtube',
            'provider_stream_id' => 'fake-broadcast-id',
            'status' => 'live',
        ]);

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/admin/users/{$broadcaster->id}", [
                'name' => $broadcaster->name,
                'can_broadcast' => false,
            ])
            ->assertOk();

        $this->assertFalse($broadcaster->fresh()->can_broadcast);
        $this->assertSame('ended', $active->fresh()->status);
        $this->assertSame('fake-broadcast-id', $active->fresh()->provider_stream_id);
    }
}
