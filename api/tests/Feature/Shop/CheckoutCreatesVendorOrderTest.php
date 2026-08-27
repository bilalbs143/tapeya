<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Enums\Shop\OrderStatusEnum;
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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutCreatesVendorOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_vendor_order_and_sale_inventory_log(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $vendor = Vendor::ensureHouse();
        $product = $this->makeProduct($vendor, stock: 10);

        $cart = Cart::create(['user_id' => $buyer->id]);
        $cart->items()->create([
            'vendor_id' => $vendor->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price_snapshot' => 100,
        ]);

        $this->actingAs($buyer, 'api')
            ->postJson('/api/v1/shop/orders', [
                'address' => 'Street 1',
                'city' => 'Lahore',
                'country' => 'Pakistan',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', OrderStatusEnum::PENDING->value);

        $order = Order::query()->first();
        $this->assertNotNull($order);
        $this->assertSame(1, VendorOrder::query()->where('order_id', $order->id)->count());
        $this->assertDatabaseHas('shop_order_items', [
            'order_id' => $order->id,
            'vendor_id' => $vendor->id,
            'quantity' => 2,
        ]);
        $this->assertSame(8, $product->fresh()->stock_quantity);
        $this->assertTrue(
            InventoryLog::query()
                ->where('product_id', $product->id)
                ->where('reason', InventoryReasonEnum::SALE->value)
                ->where('delta', -2)
                ->exists()
        );
    }

    private function makeProduct(Vendor $vendor, int $stock): Product
    {
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid(), 'is_active' => true]);

        return Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Bat',
            'slug' => 'bat-'.uniqid(),
            'sku' => 'SKU-'.uniqid(),
            'price' => 100,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'stock_quantity' => $stock,
            'is_active' => true,
        ]);
    }
}
