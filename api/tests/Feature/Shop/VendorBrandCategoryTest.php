<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\VendorStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Vendor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorBrandCategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_vendor_can_create_brand_without_sort_order(): void
    {
        [, $owner] = $this->makeApprovedVendor('Brand Shop');

        $response = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/shop/vendor/brands', [
                'name' => 'SG',
                'slug' => 'hacked-slug',
                'is_active' => false,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'SG')
            ->assertJsonPath('data.slug', 'sg')
            ->assertJsonMissingPath('data.is_active')
            ->assertJsonMissingPath('data.sort_order');

        $this->assertTrue(Brand::query()->findOrFail($response->json('data.id'))->is_active);

        $this->assertSame(0, Brand::query()->findOrFail($response->json('data.id'))->sort_order);
    }

    public function test_approved_vendor_can_update_category_and_cannot_delete(): void
    {
        [, $owner] = $this->makeApprovedVendor('Cat Shop');
        $parent = Category::query()->create([
            'name' => 'Bats',
            'slug' => 'bats-'.uniqid(),
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/shop/vendor/categories', [
                'name' => 'English Willow',
                'parent_id' => $parent->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'English Willow')
            ->assertJsonPath('data.parent_id', $parent->id)
            ->assertJsonMissingPath('data.is_active')
            ->assertJsonMissingPath('data.sort_order');

        $id = $created->json('data.id');

        $this->actingAs($owner, 'api')
            ->patchJson('/api/v1/shop/vendor/categories/'.$id, [
                'name' => 'Kashmir Willow',
                'parent_id' => null,
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Kashmir Willow')
            ->assertJsonPath('data.parent_id', null)
            ->assertJsonMissingPath('data.is_active');

        $fresh = Category::query()->findOrFail($id);
        $this->assertTrue($fresh->is_active);
        $this->assertSame(0, $fresh->sort_order);
        $this->assertSame('english-willow', $fresh->slug);

        $this->actingAs($owner, 'api')
            ->deleteJson('/api/v1/shop/vendor/categories/'.$id)
            ->assertMethodNotAllowed();

        $this->assertDatabaseHas('shop_categories', ['id' => $id]);
    }

    public function test_approved_vendor_can_rename_brand_without_changing_slug(): void
    {
        [, $owner] = $this->makeApprovedVendor('Rename Shop');
        $created = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/shop/vendor/brands', ['name' => 'TM Sports'])
            ->assertCreated();

        $id = $created->json('data.id');
        $this->assertSame('tm-sports', $created->json('data.slug'));

        $this->actingAs($owner, 'api')
            ->patchJson('/api/v1/shop/vendor/brands/'.$id, [
                'name' => 'TM Sports Pvt',
                'slug' => 'hacked-slug',
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'TM Sports Pvt')
            ->assertJsonPath('data.slug', 'tm-sports')
            ->assertJsonMissingPath('data.is_active');

        $fresh = Brand::query()->findOrFail($id);
        $this->assertTrue($fresh->is_active);
        $this->assertSame('tm-sports', $fresh->slug);

        $this->actingAs($owner, 'api')
            ->deleteJson('/api/v1/shop/vendor/brands/'.$id)
            ->assertMethodNotAllowed();
    }

    public function test_pending_vendor_can_list_but_not_mutate_brands(): void
    {
        $owner = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        Vendor::query()->create([
            'user_id' => $owner->id,
            'store_name' => 'Pending Catalog',
            'slug' => 'pending-catalog-'.uniqid(),
            'status' => VendorStatusEnum::PENDING,
            'is_platform' => false,
        ]);

        Brand::query()->create([
            'name' => 'Existing',
            'slug' => 'existing-'.uniqid(),
            'is_active' => true,
        ]);

        $this->actingAs($owner, 'api')
            ->getJson('/api/v1/shop/vendor/brands?all=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($owner, 'api')
            ->postJson('/api/v1/shop/vendor/brands', ['name' => 'New Brand'])
            ->assertForbidden()
            ->assertJsonPath('type', 'VENDOR_NOT_APPROVED');
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
}
