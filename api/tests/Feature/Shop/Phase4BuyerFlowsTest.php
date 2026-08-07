<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Brand;
use App\Models\Shop\Cart;
use App\Models\Shop\Category;
use App\Models\Shop\Order;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase4BuyerFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_cancel_pending_order(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $order = $this->makePendingOrder($buyer);

        $this->actingAs($buyer, 'api')
            ->postJson("/api/v1/shop/orders/{$order->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', OrderStatusEnum::CANCELLED->value);

        $this->assertSame(OrderStatusEnum::CANCELLED, $order->fresh()->status);
    }

    public function test_shipping_quote_and_checkout_store_address_on_order(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $vendor = Vendor::ensureHouse();
        $vendor->update(['default_shipping_amount' => 250]);
        $product = $this->makeProduct($vendor, 5);
        $cart = Cart::create(['user_id' => $buyer->id]);
        $cart->items()->create([
            'vendor_id' => $vendor->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_snapshot' => 100,
        ]);

        $this->actingAs($buyer, 'api')
            ->getJson('/api/v1/shop/shipping/quote?city=Lahore&country=Pakistan')
            ->assertOk()
            ->assertJsonPath('data.amount', 250);

        $this->actingAs($buyer, 'api')
            ->postJson('/api/v1/shop/orders', [
                'address' => 'Street 1',
                'city' => 'Lahore',
                'country' => 'Pakistan',
            ])
            ->assertCreated()
            ->assertJsonPath('data.shipping_amount', 250)
            ->assertJsonPath('data.total', 350)
            ->assertJsonPath('data.address', 'Street 1')
            ->assertJsonPath('data.city', 'Lahore')
            ->assertJsonPath('data.country', 'Pakistan');

        $this->assertDatabaseHas('shop_orders', [
            'user_id' => $buyer->id,
            'address' => 'Street 1',
            'city' => 'Lahore',
            'country' => 'Pakistan',
        ]);
    }

    public function test_admin_can_refund_paid_order(): void
    {
        $admin = User::factory()->create([
            'type' => UserTypeEnum::ADMINISTRATOR,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $order = $this->makePendingOrder($buyer);
        $order->update([
            'payment_status' => PaymentStatusEnum::PAID,
            'amount_received' => 100,
            'payment_verified_at' => now(),
        ]);

        $this->actingAs($admin, 'api')
            ->postJson("/api/v1/admin/shop/orders/{$order->id}/refund", [
                'payment_status' => PaymentStatusEnum::REFUNDED->value,
                'amount_received' => 0,
                'notes' => 'Customer return',
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatusEnum::REFUNDED->value);
    }

    private function makePendingOrder(User $buyer): Order
    {
        $vendor = Vendor::ensureHouse();
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-P4-'.uniqid(),
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
        VendorOrder::create([
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

        return $order;
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
}
