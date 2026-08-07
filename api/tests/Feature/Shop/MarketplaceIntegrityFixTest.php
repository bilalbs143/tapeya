<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Brand;
use App\Models\Shop\Cart;
use App\Models\Shop\Category;
use App\Models\Shop\InventoryLog;
use App\Models\Shop\Order;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use App\Services\Shop\CommissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceIntegrityFixTest extends TestCase
{
    use RefreshDatabase;

    public function test_commission_earnings_include_shipping_minus_discount(): void
    {
        $vendor = Vendor::query()->create([
            'user_id' => User::factory()->create([
                'type' => UserTypeEnum::USER,
                'status' => UserStatusEnum::ACTIVE,
            ])->id,
            'store_name' => 'Ship Shop',
            'slug' => 'ship-shop-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'commission_rate' => 10,
            'default_shipping_amount' => 50,
            'approved_at' => now(),
        ]);

        $amounts = app(CommissionService::class)->calculate($vendor, 100.0, 50.0, 5.0);

        $this->assertSame(10.0, $amounts['commission_amount']);
        // 100 + 50 - 5 - 10 = 135
        $this->assertSame(135.0, $amounts['vendor_earnings']);
    }

    public function test_checkout_vendor_default_shipping_is_included_in_earnings(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => 'Default Ship Vendor',
            'slug' => 'default-ship-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'commission_rate' => 10,
            'default_shipping_amount' => 40,
            'approved_at' => now(),
        ]);
        $product = $this->makeProduct($vendor, 5);

        $cart = Cart::create(['user_id' => $buyer->id]);
        $cart->items()->create([
            'vendor_id' => $vendor->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_snapshot' => 100,
        ]);

        // Flat shipping from vendor default_shipping_amount
        $this->actingAs($buyer, 'api')
            ->postJson('/api/v1/shop/orders', [
                'address' => 'Street 1',
                'city' => 'NowhereVille',
                'country' => 'Noland',
            ])
            ->assertCreated();

        $vendorOrder = VendorOrder::query()->first();
        $this->assertNotNull($vendorOrder);
        $this->assertEquals(40.0, (float) $vendorOrder->shipping_amount);
        $this->assertEquals(10.0, (float) $vendorOrder->commission_amount);
        // 100 + 40 - 0 - 10 = 130
        $this->assertEquals(130.0, (float) $vendorOrder->vendor_earnings);
    }

    public function test_admin_product_create_and_update_write_inventory_logs(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid(), 'is_active' => true]);

        $create = $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/shop/products', [
                'name' => 'Admin Bat',
                'slug' => 'admin-bat-'.uniqid(),
                'description' => 'desc',
                'price' => 200,
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'stock_quantity' => 7,
                'low_stock_threshold' => 2,
            ])
            ->assertCreated();

        $productId = (int) $create->json('data.id');
        $this->assertSame(7, Product::query()->findOrFail($productId)->stock_quantity);
        $this->assertTrue(
            InventoryLog::query()
                ->where('product_id', $productId)
                ->where('reason', InventoryReasonEnum::MANUAL->value)
                ->where('delta', 7)
                ->exists()
        );

        $this->actingAs($admin, 'api')
            ->putJson("/api/v1/admin/shop/products/{$productId}", [
                'name' => 'Admin Bat',
                'slug' => Product::query()->findOrFail($productId)->slug,
                'description' => 'desc',
                'price' => 200,
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'stock_quantity' => 4,
                'low_stock_threshold' => 2,
            ])
            ->assertOk();

        $this->assertSame(4, Product::query()->findOrFail($productId)->stock_quantity);
        $this->assertTrue(
            InventoryLog::query()
                ->where('product_id', $productId)
                ->where('reason', InventoryReasonEnum::MANUAL->value)
                ->where('delta', -3)
                ->exists()
        );
    }

    public function test_payment_verify_derives_advance_when_amount_short(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $order = $this->makeOrder($buyer, 1000);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/orders/{$order->id}/payment", [
                'payment_status' => PaymentStatusEnum::PAID->value,
                'amount_received' => 400,
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatusEnum::ADVANCE->value)
            ->assertJsonPath('data.amount_received', 400);
    }

    public function test_refund_forces_full_refund_amount_received_to_zero(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $order = $this->makeOrder($buyer, 100);
        $order->update([
            'payment_status' => PaymentStatusEnum::PAID,
            'amount_received' => 100,
            'payment_verified_at' => now(),
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/orders/{$order->id}/refund", [
                'payment_status' => PaymentStatusEnum::REFUNDED->value,
                'amount_received' => 150,
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatusEnum::REFUNDED->value)
            ->assertJsonPath('data.amount_received', 0);
    }

    private function makeProduct(Vendor $vendor, int $stock): Product
    {
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid(), 'is_active' => true]);

        return Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Item',
            'slug' => 'item-'.uniqid(),
            'sku' => 'SKU-'.uniqid(),
            'description' => 'd',
            'price' => 100,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'stock_quantity' => $stock,
            'is_active' => true,
            'status' => ProductStatusEnum::PUBLISHED,
        ]);
    }

    private function makeOrder(User $buyer, float $total): Order
    {
        $vendor = Vendor::ensureHouse();
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-FIX-'.uniqid(),
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
