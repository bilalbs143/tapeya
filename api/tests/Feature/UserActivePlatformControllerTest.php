<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserActivePlatformControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_update_active_platform(): void
    {
        $this->putJson('/api/v1/active-platform', ['platform' => 'web'])
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_update_active_platform(): void
    {
        $user = User::factory()->create(['type' => 'user']);

        $this->actingAs($user, 'api')
            ->putJson('/api/v1/active-platform', ['platform' => 'ios'])
            ->assertOk();

        $user->refresh();

        $this->assertSame('ios', $user->active_platform);
        $this->assertNotNull($user->active_platform_updated_at);
    }

    public function test_rejects_invalid_platform(): void
    {
        $user = User::factory()->create(['type' => 'user']);

        $this->actingAs($user, 'api')
            ->putJson('/api/v1/active-platform', ['platform' => 'windows'])
            ->assertUnprocessable();

        $this->assertNull($user->fresh()->active_platform);
    }

    public function test_accepts_web_ios_and_android(): void
    {
        $user = User::factory()->create(['type' => 'user']);

        foreach (['web', 'ios', 'android'] as $platform) {
            $this->actingAs($user, 'api')
                ->putJson('/api/v1/active-platform', ['platform' => $platform])
                ->assertOk();

            $this->assertSame($platform, $user->fresh()->active_platform);
        }
    }
}
