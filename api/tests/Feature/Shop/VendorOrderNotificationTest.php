<?php

namespace Tests\Feature\Shop;

use App\Enums\Push\NotificationEventEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Events\OrderPlaced;
use App\Events\VendorOrderStatusUpdated;
use App\Models\PushNotificationLog;
use App\Models\Shop\Order;
use App\Models\Shop\Vendor;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use App\Notifications\OrderPlacedVendorNotification;
use App\Notifications\VendorOrderStatusUpdatedVendorNotification;
use App\Services\Push\PushNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Tests\TestCase;

class VendorOrderNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldIgnoreMissing();
        $this->app->instance(PushNotificationService::class, $push);
    }

    public function test_order_placed_notifies_and_pushes_each_human_vendor(): void
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

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->once()
            ->with(
                NotificationEventEnum::ORDER_PLACED,
                Mockery::on(function (array $data) use ($vendorOrder) {
                    return (int) $data['vendor_order_id'] === (int) $vendorOrder->id
                        && ($data['deep_link'] ?? null) === '/seller/orders/'.$vendorOrder->id;
                }),
                (int) $sellerUser->id,
            )
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $push->shouldReceive('dispatch')
            ->with(NotificationEventEnum::ORDER_PLACED, Mockery::type('array'), Mockery::any())
            ->zeroOrMoreTimes()
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        event(new OrderPlaced($order->fresh(['vendorOrders.vendor'])));

        Notification::assertSentTo($sellerUser, OrderPlacedVendorNotification::class);
    }

    public function test_vendor_order_status_update_notifies_and_pushes_vendor(): void
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

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->once()
            ->with(
                NotificationEventEnum::ORDER_STATUS_UPDATED,
                Mockery::on(function (array $data) use ($vendorOrder) {
                    return (int) $data['vendor_order_id'] === (int) $vendorOrder->id
                        && ($data['deep_link'] ?? null) === '/seller/orders/'.$vendorOrder->id;
                }),
                (int) $sellerUser->id,
            )
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        $vendorOrder->status = OrderStatusEnum::PROCESSING;
        $vendorOrder->save();

        event(new VendorOrderStatusUpdated($vendorOrder->fresh(['vendor', 'order']), OrderStatusEnum::PENDING));

        Notification::assertSentTo($sellerUser, VendorOrderStatusUpdatedVendorNotification::class);
    }

    public function test_vendor_status_update_skips_notify_when_actor_is_vendor_owner(): void
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

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')->never();
        $this->app->instance(PushNotificationService::class, $push);

        $vendorOrder->status = OrderStatusEnum::PROCESSING;
        $vendorOrder->save();

        event(new VendorOrderStatusUpdated(
            $vendorOrder->fresh(['vendor', 'order']),
            OrderStatusEnum::PENDING,
            $sellerUser,
        ));

        Notification::assertNotSentTo($sellerUser, VendorOrderStatusUpdatedVendorNotification::class);
    }

    public function test_order_placed_skips_platform_vendor_push_and_database(): void
    {
        Notification::fake();

        $buyer = User::factory()->create([
            'type' => UserTypeEnum::USER,
            'status' => UserStatusEnum::ACTIVE,
        ]);
        $platform = $this->makeVendor('House', null, true);
        $order = $this->makeOrderWithVendorSlice($buyer, $platform);

        $push = Mockery::mock(PushNotificationService::class);
        $push->shouldReceive('dispatch')
            ->with(
                NotificationEventEnum::ORDER_PLACED,
                Mockery::on(fn (array $data) => array_key_exists('vendor_order_id', $data)),
                Mockery::any(),
            )
            ->never();
        $push->shouldReceive('dispatch')
            ->with(NotificationEventEnum::ORDER_PLACED, Mockery::type('array'), Mockery::any())
            ->zeroOrMoreTimes()
            ->andReturn(Mockery::mock(PushNotificationLog::class));
        $this->app->instance(PushNotificationService::class, $push);

        event(new OrderPlaced($order->fresh(['vendorOrders.vendor'])));

        Notification::assertSentTimes(OrderPlacedVendorNotification::class, 0);
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
}
