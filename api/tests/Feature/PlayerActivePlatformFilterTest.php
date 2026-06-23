<?php

namespace Tests\Feature;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\ActivePlatformEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerActivePlatformFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::query()->firstOrCreate(
            ['slug' => AppRoleEnum::PLAYER->value, 'guard' => RoleGuardEnum::APP->value],
            ['name' => 'Player'],
        );
    }

    public function test_players_can_be_filtered_by_stored_platform(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $playerRoleId = Role::query()
            ->where('slug', AppRoleEnum::PLAYER->value)
            ->where('guard', RoleGuardEnum::APP->value)
            ->value('id');

        $iosPlayer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => ActivePlatformEnum::IOS->value,
        ]);
        $iosPlayer->roles()->sync([$playerRoleId]);

        $webPlayer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => ActivePlatformEnum::WEB->value,
        ]);
        $webPlayer->roles()->sync([$playerRoleId]);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/players?filter[active_platform]=ios')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertSame([$iosPlayer->id], $ids);
    }

    public function test_players_can_be_filtered_by_untracked_platform(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $playerRoleId = Role::query()
            ->where('slug', AppRoleEnum::PLAYER->value)
            ->where('guard', RoleGuardEnum::APP->value)
            ->value('id');

        $untracked = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => null,
        ]);
        $untracked->roles()->sync([$playerRoleId]);

        $tracked = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'active_platform' => ActivePlatformEnum::ANDROID->value,
        ]);
        $tracked->roles()->sync([$playerRoleId]);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/players?filter[active_platform]=untracked')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertSame([$untracked->id], $ids);
    }
}
