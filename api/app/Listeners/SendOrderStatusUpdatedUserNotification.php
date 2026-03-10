<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Notifications\OrderStatusUpdatedUserNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderStatusUpdatedUserNotification implements ShouldQueue
{
    /**
     * When admin updates order status, notify the customer (database + mail).
     */
    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;
        $order->loadMissing(['user']);

        $user = $order->user;
        if ($user) {
            $user->notify(new OrderStatusUpdatedUserNotification($order, $event->previousStatus));
        }
    }
}
