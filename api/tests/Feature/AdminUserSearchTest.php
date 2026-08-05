<?php

namespace Tests\Feature;

use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_search_is_case_insensitive_for_name_and_nickname(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $target = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Taimoor Mirza',
            'nickname' => 'TM Rocket',
            'phone' => '+92-300-1112233',
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Other Player',
            'nickname' => 'Other',
            'phone' => '+92-300-9998877',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/users/search?search=taimoor')
            ->assertOk()
            ->assertJsonPath('data.0.id', $target->id)
            ->assertJsonStructure(['data' => [['id', 'name', 'nickname', 'email', 'phone']]]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/users/search?search=rocket')
            ->assertOk()
            ->assertJsonPath('data.0.id', $target->id);
    }

    public function test_admin_user_search_matches_phone_by_digits_only(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $target = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Phone Match User',
            'nickname' => 'PMU',
            'phone' => '+92-300-5556677',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/users/search?search=300-555')
            ->assertOk()
            ->assertJsonPath('data.0.id', $target->id);
    }

    public function test_admin_user_search_excludes_administrators_and_blocked_users(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $active = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Active Lookup',
            'nickname' => 'active_lookup',
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Admin Lookup',
            'nickname' => 'admin_lookup',
        ]);

        User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::BLOCKED,
            'name' => 'Blocked Lookup',
            'nickname' => 'blocked_lookup',
        ]);

        $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/users/search?search=lookup')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id);
    }
}
