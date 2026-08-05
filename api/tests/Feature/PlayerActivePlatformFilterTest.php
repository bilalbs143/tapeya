<?php

namespace Tests\Feature;

use App\Enums\User\ActivePlatformEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerActivePlatformFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_players_can_be_filtered_by_stored_platform(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $iosPlayer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => ActivePlatformEnum::IOS->value,
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => ActivePlatformEnum::WEB->value,
        ]);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/players?filter[active_platform]=ios')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertSame([$iosPlayer->id], $ids);
    }

    public function test_players_can_be_filtered_by_untracked_platform(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $untracked = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => null,
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => ActivePlatformEnum::ANDROID->value,
        ]);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/players?filter[active_platform]=untracked')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertSame([$untracked->id], $ids);
    }
}
