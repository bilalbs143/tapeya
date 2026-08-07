<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\VendorStatusEnum;
use App\Enums\User\AdminRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use App\Models\Shop\Vendor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVendorManageTest extends TestCase
{
    use RefreshDatabase;

    public function test_broadcast_operator_cannot_manage_vendors(): void
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => AdminRoleEnum::BROADCASTER->value, 'guard' => RoleGuardEnum::ADMIN->value],
            ['name' => 'Broadcast Operator']
        );
        $operator = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $operator->roles()->syncWithoutDetaching([$role->id]);

        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $this->actingAs($operator, 'api')
            ->postJson('/api/v1/admin/shop/vendors', [
                'user_id' => $owner->id,
                'store_name' => 'Blocked Store',
                'status' => VendorStatusEnum::APPROVED->value,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_create_approve_and_suspend_vendor(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $create = $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/shop/vendors', [
                'user_id' => $owner->id,
                'store_name' => 'Cricket Gear Co',
                'status' => VendorStatusEnum::PENDING->value,
                'commission_rate' => 12.5,
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', VendorStatusEnum::PENDING->value);

        $vendorId = $create->json('data.id');

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/vendors/{$vendorId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', VendorStatusEnum::APPROVED->value);

        $this->assertSame(VendorStatusEnum::APPROVED->value, $owner->fresh()->vendorStatus());

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/vendors/{$vendorId}/suspend", [
                'suspension_reason' => 'Policy',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', VendorStatusEnum::SUSPENDED->value)
            ->assertJsonPath('data.suspension_reason', 'Policy');
    }

    public function test_cannot_suspend_house_vendor(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $house = Vendor::ensureHouse();

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/vendors/{$house->id}/suspend")
            ->assertStatus(422);
    }
}
