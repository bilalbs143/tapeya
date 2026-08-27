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

class VendorProductAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_cannot_update_another_vendors_product(): void
    {
        [$vendorA, $ownerA] = $this->makeApprovedVendor('Store A');
        [$vendorB] = $this->makeApprovedVendor('Store B');

        $product = $this->makeProduct($vendorB);

        $this->actingAs($ownerA, 'api')
            ->patchJson("/api/v1/shop/vendor/products/{$product->id}", [
                'name' => 'Hacked',
                'slug' => 'hacked',
                'description' => 'nope',
                'price' => 1,
                'brand_id' => $product->brand_id,
                'category_id' => $product->category_id,
                'stock_quantity' => 1,
                'low_stock_threshold' => 1,
            ])
            ->assertNotFound();
    }

    public function test_pending_vendor_can_read_but_not_mutate_products(): void
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => 'Pending Shop',
            'slug' => 'pending-shop-'.uniqid(),
            'status' => VendorStatusEnum::PENDING,
            'is_platform' => false,
        ]);

        $this->actingAs($owner, 'api')
            ->getJson('/api/v1/shop/vendor/products')
            ->assertOk();

        $brand = Brand::create(['name' => 'B', 'slug' => 'b-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'C', 'slug' => 'c-'.uniqid(), 'is_active' => true]);

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/shop/vendor/products', [
                'name' => 'Bat',
                'slug' => 'bat',
                'description' => 'desc',
                'price' => 100,
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'stock_quantity' => 5,
                'low_stock_threshold' => 1,
            ])
            ->assertForbidden()
            ->assertJsonPath('type', 'VENDOR_NOT_APPROVED');
    }

    public function test_vendor_product_create_rejects_featured_flags(): void
    {
        [$vendor, $owner] = $this->makeApprovedVendor('Flags Shop');
        $brand = Brand::create(['name' => 'B', 'slug' => 'b-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'C', 'slug' => 'c-'.uniqid(), 'is_active' => true]);

        $response = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/shop/vendor/products', [
                'name' => 'Ball',
                'slug' => 'ball-'.uniqid(),
                'description' => 'desc',
                'price' => 50,
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'stock_quantity' => 3,
                'low_stock_threshold' => 1,
                'is_featured' => true,
                'is_popular' => true,
            ])
            ->assertCreated();

        $product = Product::query()->findOrFail($response->json('data.id'));
        $this->assertFalse($product->is_featured);
        $this->assertFalse($product->is_popular);
        $this->assertSame($vendor->id, $product->vendor_id);
    }

    /**
     * @return array{0: Vendor, 1: User}
     */
    private function makeApprovedVendor(string $name): array
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => $name,
            'slug' => strtolower(str_replace(' ', '-', $name)).'-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => false,
            'approved_at' => now(),
        ]);

        return [$vendor, $owner];
    }

    private function makeProduct(Vendor $vendor): Product
    {
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid(), 'is_active' => true]);

        return Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Item',
            'slug' => 'item-'.uniqid(),
            'sku' => 'SKU-'.uniqid(),
            'description' => 'd',
            'price' => 10,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);
    }
}
