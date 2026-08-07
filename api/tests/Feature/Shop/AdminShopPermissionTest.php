<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\User\AdminRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use App\Models\Shop\Order;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminShopPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_broadcast_operator_cannot_update_shop_order(): void
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

        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::ensureHouse();
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-2026-99902',
            'status' => OrderStatusEnum::PENDING,
            'payment_status' => PaymentStatusEnum::UNPAID,
            'subtotal' => 10,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'total' => 10,
            'currency' => 'PKR',
            'address' => 'A',
            'city' => 'Lahore',
            'country' => 'Pakistan',
            'placed_at' => now(),
        ]);
        VendorOrder::create([
            'order_id' => $order->id,
            'vendor_id' => $vendor->id,
            'vendor_order_number' => $order->order_number.'-V1',
            'status' => OrderStatusEnum::PENDING,
            'subtotal' => 10,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'commission_rate_snapshot' => 10,
            'commission_amount' => 1,
            'vendor_earnings' => 9,
            'total' => 10,
        ]);

        $this->actingAs($operator, 'api')
            ->patchJson("/api/v1/admin/shop/orders/{$order->id}", [
                'status' => OrderStatusEnum::PROCESSING->value,
            ])
            ->assertForbidden();
    }

    public function test_administrator_can_update_shop_order(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::ensureHouse();
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-2026-99903',
            'status' => OrderStatusEnum::PENDING,
            'payment_status' => PaymentStatusEnum::UNPAID,
            'subtotal' => 10,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'total' => 10,
            'currency' => 'PKR',
            'address' => 'A',
            'city' => 'Lahore',
            'country' => 'Pakistan',
            'placed_at' => now(),
        ]);
        VendorOrder::create([
            'order_id' => $order->id,
            'vendor_id' => $vendor->id,
            'vendor_order_number' => $order->order_number.'-V1',
            'status' => OrderStatusEnum::PENDING,
            'subtotal' => 10,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'commission_rate_snapshot' => 10,
            'commission_amount' => 1,
            'vendor_earnings' => 9,
            'total' => 10,
        ]);

        $this->actingAs($admin, 'api')
            ->patchJson("/api/v1/admin/shop/orders/{$order->id}", [
                'status' => OrderStatusEnum::PROCESSING->value,
            ])
            ->assertOk();

        $this->assertSame(OrderStatusEnum::PROCESSING, $order->fresh()->status);
    }
}
