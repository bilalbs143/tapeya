<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Notifications\OrderStatusUpdatedUserMailNotification;
use App\Notifications\OrderStatusUpdatedUserNotification;

class SendOrderStatusUpdatedUserNotification
{
    /**
     * When admin updates order status, notify the customer (database immediately for Reverb + queued mail).
     */
    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;
        $order->loadMissing(['user']);

        $user = $order->user;
        if (! $user) {
            return;
        }

        $previous = $event->previousStatus;

        $user->notify(new OrderStatusUpdatedUserNotification($order, $previous));
        $user->notify(new OrderStatusUpdatedUserMailNotification($order, $previous));
    }
}
