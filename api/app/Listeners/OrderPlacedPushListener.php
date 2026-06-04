<?php

namespace App\Listeners;

use App\Enums\Push\NotificationEventEnum;
use App\Events\OrderPlaced;
use App\Services\Push\PushNotificationService;
use Illuminate\Support\Facades\Log;

class OrderPlacedPushListener
{
    public function __construct(
        private readonly PushNotificationService $pushService,
    ) {}

    public function handle(OrderPlaced $event): void
    {
        try {
            $order = $event->order;
            $order->loadMissing(['user']);

            if ($order->user_id === null) {
                return;
            }

            $this->pushService->dispatch(
                NotificationEventEnum::ORDER_PLACED,
                [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total' => (string) $order->total,
                    'currency' => $order->currency,
                ],
                $order->user_id,
            );
        } catch (\Throwable $e) {
            Log::error('OrderPlacedPushListener failed', [
                'order_id' => $event->order->id ?? null,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
