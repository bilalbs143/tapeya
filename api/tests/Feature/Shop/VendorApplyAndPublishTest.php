<?php

namespace Tests\Feature\Shop;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\User;
use App\Notifications\VendorApplicationSubmittedAdminNotification;
use App\Utils\Services\SystemUserService;
use Database\Seeders\SystemUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class VendorApplyAndPublishTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_apply_as_vendor_and_publish_is_sellable(): void
    {
        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/shop/vendor/apply', [
                'store_name' => 'My Cricket Store',
                'city' => 'Lahore',
                'country' => 'Pakistan',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', VendorStatusEnum::PENDING->value);

        $vendor = Vendor::query()->where('user_id', $user->id)->firstOrFail();
        $vendor->update([
            'status' => VendorStatusEnum::APPROVED,
            'approved_at' => now(),
        ]);

        $brand = Brand::create(['name' => 'B', 'slug' => 'b-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'C', 'slug' => 'c-'.uniqid(), 'is_active' => true]);

        $create = $this->actingAs($user, 'api')
            ->postJson('/api/v1/shop/vendor/products', [
                'name' => 'Bat',
                'slug' => 'bat-'.uniqid(),
                'description' => 'desc',
                'price' => 100,
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'stock_quantity' => 5,
                'low_stock_threshold' => 1,
            ])
            ->assertCreated();

        $productId = $create->json('data.id');
        $product = Product::query()->findOrFail($productId);

        $this->assertTrue($product->isSellable());
    }

    public function test_vendor_apply_notifies_admin_inbox(): void
    {
        $this->seed(SystemUserSeeder::class);
        Notification::fake();

        $user = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Seller Applicant',
        ]);

        $this->actingAs($user, 'api')
            ->postJson('/api/v1/shop/vendor/apply', [
                'store_name' => 'Demo Cricket Store',
                'city' => 'Karachi',
                'country' => 'Pakistan',
            ])
            ->assertCreated();

        $systemUser = SystemUserService::get();
        $this->assertNotNull($systemUser);

        Notification::assertSentTo(
            $systemUser,
            VendorApplicationSubmittedAdminNotification::class,
            function (VendorApplicationSubmittedAdminNotification $notification) use ($systemUser, $user) {
                $data = $notification->toArray($systemUser);

                return $data['type'] === AdminNotificationTypeEnum::VENDOR_APPLICATION_SUBMITTED->value
                    && $data['store_name'] === 'Demo Cricket Store'
                    && $data['user_id'] === $user->id
                    && str_contains($data['message'], 'Demo Cricket Store');
            }
        );
    }
}
