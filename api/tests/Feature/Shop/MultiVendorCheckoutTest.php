<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\VendorStatusEnum;
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

class MultiVendorCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_splits_into_one_vendor_order_per_vendor(): void
    {
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $vendorA = $this->makeVendor('Alpha Shop');
        $vendorB = $this->makeVendor('Beta Shop');
        $productA = $this->makeProduct($vendorA, 10);
        $productB = $this->makeProduct($vendorB, 10);

        $cart = Cart::create(['user_id' => $buyer->id]);
        $cart->items()->create([
            'vendor_id' => $vendorA->id,
            'product_id' => $productA->id,
            'quantity' => 1,
            'price_snapshot' => 100,
        ]);
        $cart->items()->create([
            'vendor_id' => $vendorB->id,
            'product_id' => $productB->id,
            'quantity' => 2,
            'price_snapshot' => 50,
        ]);

        $this->actingAs($buyer, 'api')
            ->getJson('/api/v1/shop/cart')
            ->assertOk()
            ->assertJsonCount(2, 'data.vendor_groups');

        $this->actingAs($buyer, 'api')
            ->postJson('/api/v1/shop/orders', [
                'address' => 'Street 1',
                'city' => 'Lahore',
                'country' => 'Pakistan',
            ])
            ->assertCreated();

        $order = Order::query()->first();
        $this->assertNotNull($order);
        $this->assertSame(2, VendorOrder::query()->where('order_id', $order->id)->count());
        $this->assertEqualsCanonicalizing(
            [$vendorA->id, $vendorB->id],
            VendorOrder::query()->where('order_id', $order->id)->pluck('vendor_id')->all()
        );
    }

    private function makeVendor(string $name): Vendor
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        return Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => $name,
            'slug' => strtolower(str_replace(' ', '-', $name)).'-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);
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
        ]);
    }
}
