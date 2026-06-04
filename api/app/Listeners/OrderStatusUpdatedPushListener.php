<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Events\OrderStatusUpdated;
use App\Services\Push\PushNotificationService;
use Illuminate\Support\Facades\Log;

class OrderStatusUpdatedPushListener
{
    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(OrderStatusUpdated $event): void
    {
        try {
            if ($this->isStatusUnchanged($event)) {
                return;
            }

            $order = $event->order;
            $order->loadMissing(['user']);

            if ($order->user_id === null) {
                return;
            }

            $status = $order->status instanceof OrderStatusEnum
                ? $order->status->value
                : (string) $order->status;

            if ($status === OrderStatusEnum::DELIVERED->value) {
                $this->pushService->dispatch(
                    NotificationEventEnum::ORDER_DELIVERED,
                    [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ],
                    $order->user_id,
                );

                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::ORDER_STATUS_UPDATED,
                [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status instanceof OrderStatusEnum
                        ? $order->status->label()
                        : (string) $order->status,
                ],
                $order->user_id,
            );
        } catch (\Throwable $e) {
            Log::error('OrderStatusUpdatedPushListener failed', [
                'order_id' => $event->order->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function isStatusUnchanged(OrderStatusUpdated $event): bool
    {
        if ($event->previousStatus === null) {
            return false;
        }

        $current = $event->order->status instanceof OrderStatusEnum
            ? $event->order->status
            : OrderStatusEnum::tryFrom((string) $event->order->status);

        return $current !== null && $event->previousStatus === $current;
    }
}
