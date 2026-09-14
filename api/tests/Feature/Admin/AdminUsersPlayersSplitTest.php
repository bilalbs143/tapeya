<?php

namespace Tests\Feature\Admin;

use App\Enums\User\AdminRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUsersPlayersSplitTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_index_lists_only_backoffice_accounts(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $player = User::factory()->create(['type' => UserTypeEnum::USER]);
        $staff = User::factory()->create(['type' => UserTypeEnum::USER]);

        $role = Role::query()->firstOrCreate(
            ['slug' => AdminRoleEnum::BROADCASTER->value, 'guard' => RoleGuardEnum::ADMIN->value],
            ['name' => 'Broadcast Operator']
        );
        $staff->roles()->syncWithoutDetaching([$role->id]);

        $ids = collect(
            $this->actingAs($admin, 'api')
                ->getJson('/api/v1/admin/users')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertContains($admin->id, $ids);
        $this->assertContains($staff->id, $ids);
        $this->assertNotContains($player->id, $ids);
    }

    public function test_players_index_lists_only_app_players_without_admin_roles(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);
        $player = User::factory()->create(['type' => UserTypeEnum::USER]);
        $staff = User::factory()->create(['type' => UserTypeEnum::USER]);

        $role = Role::query()->firstOrCreate(
            ['slug' => AdminRoleEnum::BROADCASTER->value, 'guard' => RoleGuardEnum::ADMIN->value],
            ['name' => 'Broadcast Operator']
        );
        $staff->roles()->syncWithoutDetaching([$role->id]);

        $ids = collect(
            $this->actingAs($admin, 'api')
                ->getJson('/api/v1/admin/players')
                ->assertOk()
                ->json('data')
        )->pluck('id')->all();

        $this->assertContains($player->id, $ids);
        $this->assertNotContains($admin->id, $ids);
        $this->assertNotContains($staff->id, $ids);
    }

    public function test_store_staff_user_requires_admin_role(): void
    {
        $admin = User::factory()->create(['type' => UserTypeEnum::ADMINISTRATOR]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/users', [
                'name' => 'Staff Person',
                'nickname' => 'StaffPerson',
                'phone' => '+921111111111',
                'type' => UserTypeEnum::USER->value,
                'admin_role_ids' => [],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['admin_role_ids']);
    }
}
