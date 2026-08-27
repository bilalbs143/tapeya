<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
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

class OrderPaymentVerifyTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_record_advance_and_paid(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $order = $this->makeOrder($buyer, total: 1000);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/orders/{$order->id}/payment", [
                'payment_status' => PaymentStatusEnum::ADVANCE->value,
                'amount_received' => 400,
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatusEnum::ADVANCE->value)
            ->assertJsonPath('data.amount_received', 400);

        $this->assertNotNull($order->fresh()->payment_verified_at);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/orders/{$order->id}/payment", [
                'payment_status' => PaymentStatusEnum::PAID->value,
                'amount_received' => 1000,
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatusEnum::PAID->value)
            ->assertJsonPath('data.amount_received', 1000);
    }

    public function test_buyer_payment_pending_endpoint_is_gone(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $order = $this->makeOrder($buyer, total: 100);

        $this->actingAs($buyer, 'api')
            ->postJson("/api/v1/shop/orders/{$order->id}/payment/pending")
            ->assertNotFound();
    }

    public function test_admin_can_refund_advance_order(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $order = $this->makeOrder($buyer, total: 1000);
        $order->update([
            'payment_status' => PaymentStatusEnum::ADVANCE,
            'amount_received' => 400,
            'payment_verified_at' => now(),
            'payment_verified_by' => $admin->id,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/orders/{$order->id}/refund", [
                'payment_status' => PaymentStatusEnum::REFUNDED->value,
                'notes' => 'Advance returned',
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatusEnum::REFUNDED->value)
            ->assertJsonPath('data.amount_received', 0);
    }

    public function test_buyer_cannot_cancel_when_payment_recorded(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $order = $this->makeOrder($buyer, total: 100);
        $order->update([
            'payment_status' => PaymentStatusEnum::PAID,
            'amount_received' => 100,
            'payment_verified_at' => now(),
        ]);

        $this->actingAs($buyer, 'api')
            ->postJson("/api/v1/shop/orders/{$order->id}/cancel")
            ->assertStatus(422);

        $this->assertSame(OrderStatusEnum::PENDING, $order->fresh()->status);
        $this->assertSame(PaymentStatusEnum::PAID, $order->fresh()->payment_status);
    }

    public function test_broadcast_operator_cannot_verify_payment(): void
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
        $order = $this->makeOrder($buyer, total: 100);

        $this->actingAs($operator, 'api')
            ->postJson("/api/v1/admin/shop/orders/{$order->id}/payment", [
                'payment_status' => PaymentStatusEnum::PAID->value,
                'amount_received' => 100,
            ])
            ->assertForbidden();
    }

    public function test_admin_order_show_includes_soft_deleted_buyer(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Abdul Hanan',
            'email' => 'abdulhanankhokhar5232@gmail.com',
        ]);
        $order = $this->makeOrder($buyer, total: 100);
        $buyer->delete();

        $this->assertSoftDeleted($buyer);

        $this->actingAs($admin, 'api')
            ->getJson("/api/v1/admin/shop/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.user_id', $buyer->id)
            ->assertJsonPath('data.user.id', $buyer->id)
            ->assertJsonPath('data.user.name', 'Abdul Hanan')
            ->assertJsonPath('data.user.email', 'abdulhanankhokhar5232@gmail.com');
    }

    public function test_vendor_can_record_payment_on_owned_order(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $seller = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::query()->create([
            'user_id' => $seller->id,
            'store_name' => 'Seller Shop',
            'slug' => 'seller-shop-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-2026-VPAY-'.uniqid(),
            'status' => OrderStatusEnum::PENDING,
            'payment_status' => PaymentStatusEnum::UNPAID,
            'payment_method' => 'cod',
            'subtotal' => 905,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'total' => 905,
            'currency' => 'PKR',
            'address' => 'A',
            'city' => 'Lahore',
            'country' => 'Pakistan',
            'placed_at' => now(),
        ]);
        $vendorOrder = VendorOrder::create([
            'order_id' => $order->id,
            'vendor_id' => $vendor->id,
            'vendor_order_number' => $order->order_number.'-V1',
            'status' => OrderStatusEnum::PENDING,
            'subtotal' => 905,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'commission_rate_snapshot' => 10,
            'commission_amount' => 90.5,
            'vendor_earnings' => 814.5,
            'total' => 905,
        ]);

        $this->actingAs($seller, 'api')
            ->postJson('/api/v1/shop/vendor/orders/'.$vendorOrder->id.'/payment', [
                'payment_status' => PaymentStatusEnum::PAID->value,
                'amount_received' => 905,
            ])
            ->assertOk()
            ->assertJsonPath('data.order.payment_status', PaymentStatusEnum::PAID->value)
            ->assertJsonPath('data.order.amount_received', 905);

        $fresh = $order->fresh();
        $this->assertSame(PaymentStatusEnum::PAID, $fresh->payment_status);
        $this->assertSame($seller->id, $fresh->payment_verified_by);
    }

    public function test_vendor_cannot_update_payment_for_another_vendors_order(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $other = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => 'Owner Shop',
            'slug' => 'owner-shop-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);
        Vendor::query()->create([
            'user_id' => $other->id,
            'store_name' => 'Other Shop',
            'slug' => 'other-shop-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-2026-VPAY2-'.uniqid(),
            'status' => OrderStatusEnum::PENDING,
            'payment_status' => PaymentStatusEnum::UNPAID,
            'payment_method' => 'cod',
            'subtotal' => 100,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'total' => 100,
            'currency' => 'PKR',
            'address' => 'A',
            'city' => 'Lahore',
            'country' => 'Pakistan',
            'placed_at' => now(),
        ]);
        $vendorOrder = VendorOrder::create([
            'order_id' => $order->id,
            'vendor_id' => $vendor->id,
            'vendor_order_number' => $order->order_number.'-V1',
            'status' => OrderStatusEnum::PENDING,
            'subtotal' => 100,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'commission_rate_snapshot' => 10,
            'commission_amount' => 10,
            'vendor_earnings' => 90,
            'total' => 100,
        ]);

        $this->actingAs($other, 'api')
            ->postJson('/api/v1/shop/vendor/orders/'.$vendorOrder->id.'/payment', [
                'payment_status' => PaymentStatusEnum::PAID->value,
                'amount_received' => 100,
            ])
            ->assertNotFound();
    }

    private function makeOrder(User $buyer, float $total): Order
    {
        $vendor = Vendor::ensureHouse();
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-2026-PAY-'.uniqid(),
            'status' => OrderStatusEnum::PENDING,
            'payment_status' => PaymentStatusEnum::UNPAID,
            'payment_method' => 'cod',
            'subtotal' => $total,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'total' => $total,
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
            'subtotal' => $total,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'commission_rate_snapshot' => 10,
            'commission_amount' => $total * 0.1,
            'vendor_earnings' => $total * 0.9,
            'total' => $total,
        ]);

        return $order;
    }
}
