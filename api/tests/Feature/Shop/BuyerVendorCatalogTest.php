<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\ProductStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyerVendorCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_sees_sold_by_vendor_on_product_and_store_page(): void
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
            'store_name' => 'Tapeya Pro Shop',
            'slug' => 'tapeya-pro-shop',
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);
        $product = $this->makeProduct($vendor, ProductStatusEnum::PUBLISHED);

        $this->actingAs($buyer, 'api')
            ->getJson('/api/v1/shop/products/'.$product->slug)
            ->assertOk()
            ->assertJsonPath('data.vendor.store_name', 'Tapeya Pro Shop')
            ->assertJsonPath('data.vendor.slug', 'tapeya-pro-shop');

        $this->actingAs($buyer, 'api')
            ->getJson('/api/v1/shop/vendors/tapeya-pro-shop')
            ->assertOk()
            ->assertJsonPath('data.store_name', 'Tapeya Pro Shop');
    }

    public function test_suspended_vendor_products_are_hidden_from_catalog(): void
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
            'store_name' => 'Suspended Shop',
            'slug' => 'suspended-shop',
            'status' => VendorStatusEnum::SUSPENDED,
            'is_platform' => false,
            'suspended_at' => now(),
        ]);
        $product = $this->makeProduct($vendor, ProductStatusEnum::PUBLISHED);

        $this->actingAs($buyer, 'api')
            ->getJson('/api/v1/shop/products/'.$product->slug)
            ->assertNotFound();

        $this->actingAs($buyer, 'api')
            ->getJson('/api/v1/shop/products')
            ->assertOk()
            ->assertJsonMissing(['id' => $product->id]);

        $this->actingAs($buyer, 'api')
            ->postJson('/api/v1/shop/cart/items', [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertNotFound();
    }

    private function makeProduct(Vendor $vendor, ProductStatusEnum $status): Product
    {
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid(), 'is_active' => true]);

        return Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Bat',
            'slug' => 'bat-'.uniqid(),
            'sku' => 'SKU-'.uniqid(),
            'description' => 'A bat',
            'price' => 100,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'stock_quantity' => 5,
            'is_active' => true,
            'status' => $status,
        ]);
    }
}
