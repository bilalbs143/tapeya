<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\OrderPlaced;
use App\Services\Push\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Push each human vendor when a marketplace order is placed (skip house).
 * Uses the same ORDER_PLACED event/templates as buyer notifications.
 */
class OrderPlacedVendorPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(OrderPlaced $event): void
    {
        try {
            $order = $event->order;
            $order->loadMissing(['vendorOrders.vendor']);

            foreach ($order->vendorOrders as $vendorOrder) {
                $vendor = $vendorOrder->vendor;
                if ($vendor === null || $vendor->is_platform || $vendor->user_id === null) {
                    continue;
                }

                $this->pushService->dispatch(
                    NotificationEventEnum::ORDER_PLACED,
                    [
                        'order_id' => $order->id,
                        'order_number' => $vendorOrder->vendor_order_number,
                        'vendor_order_id' => $vendorOrder->id,
                        'vendor_order_number' => $vendorOrder->vendor_order_number,
                        'total' => (string) $vendorOrder->total,
                        'currency' => $order->currency,
                        'deep_link' => '/seller/orders/'.$vendorOrder->id,
                    ],
                    (int) $vendor->user_id,
                );
            }
        } catch (\Throwable $e) {
            Log::error('OrderPlacedVendorPushListener failed', [
                'order_id' => $event->order->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
