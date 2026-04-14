<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Notifications\OrderPlacedUserNotification;

/**
 * Runs in the same request as checkout: writes the customer database notification immediately so
 * {@see BroadcastUserDatabaseNotification} can reach Reverb without waiting for the queue.
 */
class SendOrderPlacedCustomerDatabaseNotification
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        $order->loadMissing(['user']);

        $user = $order->user;
        if ($user) {
            $user->notify(new OrderPlacedUserNotification($order));
        }
    }
}
