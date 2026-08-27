<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Events\VendorOrderStatusUpdated;
use App\Services\Push\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Push the selling vendor when their slice status changes (skip house and self-actor).
 * Uses the same ORDER_STATUS_UPDATED / ORDER_DELIVERED events as buyer notifications.
 */
class VendorOrderStatusUpdatedVendorPushListener implements ShouldQueue
{
    public string $queue = 'push-notifications';

    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(VendorOrderStatusUpdated $event): void
    {
        try {
            $vendorOrder = $event->vendorOrder;
            $vendorOrder->loadMissing(['vendor', 'order']);

            $vendor = $vendorOrder->vendor;
            if ($vendor === null || $vendor->is_platform || $vendor->user_id === null) {
                return;
            }

            if ($event->actor !== null && (int) $event->actor->id === (int) $vendor->user_id) {
                return;
            }

            $status = $vendorOrder->status instanceof OrderStatusEnum
                ? $vendorOrder->status
                : OrderStatusEnum::tryFrom((string) $vendorOrder->status);

            $statusLabel = $status?->label() ?? (string) ($vendorOrder->status?->value ?? '');
            $payload = [
                'order_id' => $vendorOrder->order_id,
                'order_number' => $vendorOrder->vendor_order_number,
                'vendor_order_id' => $vendorOrder->id,
                'vendor_order_number' => $vendorOrder->vendor_order_number,
                'status' => $statusLabel,
                'deep_link' => '/seller/orders/'.$vendorOrder->id,
            ];

            if ($status === OrderStatusEnum::DELIVERED) {
                $this->pushService->dispatch(
                    NotificationEventEnum::ORDER_DELIVERED,
                    $payload,
                    (int) $vendor->user_id,
                );

                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::ORDER_STATUS_UPDATED,
                $payload,
                (int) $vendor->user_id,
            );
        } catch (\Throwable $e) {
            Log::error('VendorOrderStatusUpdatedVendorPushListener failed', [
                'vendor_order_id' => $event->vendorOrder->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
