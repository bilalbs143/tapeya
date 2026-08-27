<?php

namespace Tests\Feature\Shop;

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

class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_gets_are_public(): void
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => 'Public Shop',
            'slug' => 'public-shop',
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-pub', 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-pub', 'is_active' => true]);
        $product = Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Public Bat',
            'slug' => 'public-bat',
            'sku' => 'SKU-PUB',
            'description' => 'd',
            'price' => 100,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/shop/products')->assertOk();
        $this->getJson('/api/v1/shop/products/'.$product->slug)->assertOk();
        $this->getJson('/api/v1/shop/brands')->assertOk();
        $this->getJson('/api/v1/shop/categories')->assertOk();
        $this->getJson('/api/v1/shop/vendors')->assertOk();
        $this->getJson('/api/v1/shop/vendors/public-shop')->assertOk();

        $this->getJson('/api/v1/shop/cart')->assertUnauthorized();
    }

    public function test_brands_has_products_omits_empty_brands(): void
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => 'Public Shop',
            'slug' => 'public-shop-brands',
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);
        $withProduct = Brand::create(['name' => 'TM Sports', 'slug' => 'tm-sports-pub', 'is_active' => true]);
        $empty = Brand::create(['name' => 'Empty Brand', 'slug' => 'empty-brand-pub', 'is_active' => true]);
        $inactiveOnly = Brand::create(['name' => 'Inactive Only', 'slug' => 'inactive-only-pub', 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-brands-pub', 'is_active' => true]);

        Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Public Bat',
            'slug' => 'public-bat-brands',
            'sku' => 'SKU-PUB-BRANDS',
            'description' => 'd',
            'price' => 100,
            'brand_id' => $withProduct->id,
            'category_id' => $category->id,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);
        Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Hidden Bat',
            'slug' => 'hidden-bat-brands',
            'sku' => 'SKU-HID-BRANDS',
            'description' => 'd',
            'price' => 100,
            'brand_id' => $inactiveOnly->id,
            'category_id' => $category->id,
            'stock_quantity' => 5,
            'is_active' => false,
        ]);

        $all = $this->getJson('/api/v1/shop/brands?all=1')->assertOk()->json('data');
        $this->assertEqualsCanonicalizing(
            [$withProduct->id, $empty->id, $inactiveOnly->id],
            array_column($all, 'id'),
        );

        $listed = $this->getJson('/api/v1/shop/brands?all=1&has_products=1')->assertOk()->json('data');
        $this->assertSame([$withProduct->id], array_column($listed, 'id'));
    }
}
