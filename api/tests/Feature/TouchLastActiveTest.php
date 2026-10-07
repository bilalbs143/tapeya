<?php

namespace Tests\Feature;

use App\Http\Middleware\TouchLastActive;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class TouchLastActiveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_authenticated_request_sets_last_active_at(): void
    {
        $user = User::factory()->create([
            'type' => 'user',
            'last_active_at' => null,
        ]);

        $this->actingAs($user, 'api')
            ->getJson('/api/v1/me')
            ->assertOk();

        $this->assertNotNull($user->fresh()->last_active_at);
    }

    public function test_rapid_requests_only_write_once_within_throttle_window(): void
    {
        $user = User::factory()->create([
            'type' => 'user',
            'last_active_at' => null,
        ]);

        $this->actingAs($user, 'api')->getJson('/api/v1/me')->assertOk();
        $first = $user->fresh()->last_active_at;
        $this->assertNotNull($first);

        // Force a different timestamp if a second write happened.
        User::query()->whereKey($user->id)->update([
            'last_active_at' => $first->copy()->subHour(),
        ]);
        $stale = $user->fresh()->last_active_at;

        // Cache key still held from first request — middleware must not overwrite.
        $this->assertTrue(Cache::has(TouchLastActive::CACHE_KEY_PREFIX.$user->id));

        $this->actingAs($user, 'api')->getJson('/api/v1/me')->assertOk();

        $this->assertTrue(
            $stale->equalTo($user->fresh()->last_active_at),
            'Second request within throttle window must not bump last_active_at'
        );
    }

    public function test_platform_update_always_bumps_last_active_at(): void
    {
        $user = User::factory()->create([
            'type' => 'user',
            'last_active_at' => now()->subDay(),
        ]);

        // Simulate throttle already consumed.
        Cache::put(TouchLastActive::CACHE_KEY_PREFIX.$user->id, 1, TouchLastActive::THROTTLE_SECONDS);

        $this->actingAs($user, 'api')
            ->putJson('/api/v1/active-platform', ['platform' => 'android'])
            ->assertOk();

        $user->refresh();
        $this->assertSame('android', $user->active_platform);
        $this->assertTrue($user->last_active_at->greaterThan(now()->subMinute()));
    }
}
