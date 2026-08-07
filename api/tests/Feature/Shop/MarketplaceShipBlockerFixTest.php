<?php

namespace Tests\Feature\Shop;

use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Order;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use App\Notifications\OrderStatusUpdatedUserNotification;
use App\Services\Push\PushNotificationService;
use App\Services\Shop\VendorOrderStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Tests\TestCase;

class MarketplaceShipBlockerFixTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldIgnoreMissing();
        $this->app->instance(PushNotificationService::class, $push);
    }

    public function test_vendor_status_transition_notifies_buyer_when_parent_aggregate_changes(): void
    {
        Notification::fake();

        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $sellerUser = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $vendor = $this->makeVendor('Seller Shop', $sellerUser);
        $order = $this->makeOrderWithVendorSlice($buyer, $vendor);
        $vendorOrder = $order->vendorOrders->first();

        app(VendorOrderStatusService::class)->transition(
            $vendorOrder,
            OrderStatusEnum::PROCESSING,
            $sellerUser,
            asAdmin: false,
        );

        Notification::assertSentTo($buyer, OrderStatusUpdatedUserNotification::class);
        $this->assertSame(OrderStatusEnum::PROCESSING, $order->fresh()->status);
    }

    public function test_vendor_order_resource_includes_payment_status(): void
    {
        $sellerUser = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
            'name' => 'Ali Khan',
            'phone' => '+923001234567',
        ]);
        $vendor = $this->makeVendor('Seller Shop', $sellerUser);
        $order = $this->makeOrderWithVendorSlice($buyer, $vendor);
        $order->update(['payment_status' => PaymentStatusEnum::PAID]);
        $vendorOrder = $order->vendorOrders->first();

        $this->actingAs($sellerUser, 'api')
            ->getJson('/api/v1/shop/vendor/orders/'.$vendorOrder->id)
            ->assertOk()
            ->assertJsonPath('data.order.payment_status', PaymentStatusEnum::PAID->value)
            ->assertJsonPath('data.order.payment_status_label', 'Paid')
            ->assertJsonPath('data.customer.name', 'Ali Khan')
            ->assertJsonPath('data.customer.phone', '+923001234567');
    }

    public function test_ambiguous_product_slug_returns_not_found_without_vendor_scope(): void
    {
        $vendorA = $this->makeVendor('Shop A', User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]));
        $vendorB = $this->makeVendor('Shop B', User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]));
        $this->makeProduct($vendorA, 'shared-bat');
        $this->makeProduct($vendorB, 'shared-bat');

        $this->getJson('/api/v1/shop/products/shared-bat')
            ->assertNotFound();

        $this->getJson('/api/v1/shop/products/shared-bat?vendor='.$vendorA->slug)
            ->assertOk()
            ->assertJsonPath('data.vendor.slug', $vendorA->slug);

        $this->getJson('/api/v1/shop/vendors/'.$vendorB->slug.'/products/shared-bat')
            ->assertOk()
            ->assertJsonPath('data.vendor.slug', $vendorB->slug);
    }

    public function test_unique_product_slug_still_resolves_without_vendor(): void
    {
        $vendor = $this->makeVendor('Solo Shop', User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]));
        $product = $this->makeProduct($vendor, 'unique-bat');

        $this->getJson('/api/v1/shop/products/unique-bat')
            ->assertOk()
            ->assertJsonPath('data.id', $product->id);
    }

    private function makeVendor(string $storeName, ?User $owner = null, bool $isPlatform = false): Vendor
    {
        return Vendor::query()->create([
            'user_id' => $owner?->id,
            'store_name' => $storeName,
            'slug' => str($storeName)->slug()->toString().'-'.uniqid(),
            'status' => VendorStatusEnum::APPROVED,
            'is_platform' => $isPlatform,
            'commission_rate' => 10,
            'default_shipping_amount' => 0,
            'approved_at' => now(),
        ]);
    }

    private function makeOrderWithVendorSlice(User $buyer, Vendor $vendor): Order
    {
        $order = Order::create([
            'user_id' => $buyer->id,
            'order_number' => 'TAP-TEST-'.uniqid(),
            'status' => OrderStatusEnum::PENDING,
            'payment_status' => PaymentStatusEnum::UNPAID,
            'subtotal' => 100,
            'shipping_amount' => 0,
            'total' => 100,
            'currency' => 'PKR',
            'address' => '1 Street',
            'city' => 'Lahore',
            'country' => 'PK',
        ]);

        VendorOrder::create([
            'order_id' => $order->id,
            'vendor_id' => $vendor->id,
            'vendor_order_number' => $order->order_number.'-V1',
            'status' => OrderStatusEnum::PENDING,
            'subtotal' => 100,
            'shipping_amount' => 0,
            'commission_amount' => 10,
            'vendor_earnings' => 90,
            'total' => 100,
            'commission_rate_snapshot' => 10,
        ]);

        return $order->fresh(['vendorOrders.vendor']);
    }

    private function makeProduct(Vendor $vendor, string $slug): Product
    {
        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand-'.uniqid(), 'is_active' => true]);
        $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid(), 'is_active' => true]);

        return Product::create([
            'vendor_id' => $vendor->id,
            'name' => 'Bat',
            'slug' => $slug,
            'sku' => 'SKU-'.uniqid(),
            'description' => 'A bat',
            'price' => 100,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'stock_quantity' => 5,
            'is_active' => true,
            'status' => ProductStatusEnum::PUBLISHED,
        ]);
    }
}
