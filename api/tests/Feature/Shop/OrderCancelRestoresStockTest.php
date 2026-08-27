<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\InventoryLog;
use App\Models\Shop\Order;
use App\Models\Shop\OrderItem;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCancelRestoresStockTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cancel_restores_stock_with_inventory_log(): void
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
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-c-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-c-'.uniqid(), 'is_active' => true]);
        $product = Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Ball',
            'slug' => 'ball-'.uniqid(),
            'sku' => 'BALL-'.uniqid(),
            'price' => 50,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-2026-99901',
            'status' => OrderStatusEnum::PENDING,
            'payment_status' => PaymentStatusEnum::UNPAID,
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

        OrderItem::create([
            'order_id' => $order->id,
            'vendor_id' => $vendor->id,
            'vendor_order_id' => $vendorOrder->id,
            'product_id' => $product->id,
            'product_snapshot' => ['name' => 'Ball'],
            'quantity' => 2,
            'unit_price' => 50,
            'total_price' => 100,
        ]);

        // Stock already decremented as if sold.
        $product->update(['stock_quantity' => 3]);

        $this->actingAs($admin, 'api')
            ->patchJson("/api/v1/admin/shop/orders/{$order->id}", [
                'status' => OrderStatusEnum::CANCELLED->value,
            ])
            ->assertOk();

        $this->assertSame(5, $product->fresh()->stock_quantity);
        $this->assertSame(OrderStatusEnum::CANCELLED, $order->fresh()->status);
        $this->assertTrue(
            InventoryLog::query()
                ->where('product_id', $product->id)
                ->where('reason', InventoryReasonEnum::CANCEL_RESTORE->value)
                ->where('delta', 2)
                ->exists()
        );
    }
}
