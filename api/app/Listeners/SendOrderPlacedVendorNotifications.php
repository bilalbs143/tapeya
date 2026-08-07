<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Notifications\OrderPlacedVendorNotification;

/**
 * Fan-out OrderPlaced to each human vendor (skip house / null user_id).
 */
class SendOrderPlacedVendorNotifications
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        $order->loadMissing(['vendorOrders.vendor.user']);

        foreach ($order->vendorOrders as $vendorOrder) {
            $vendor = $vendorOrder->vendor;
            if ($vendor === null || $vendor->is_platform || $vendor->user === null) {
                continue;
            }

            $vendor->user->notify(new OrderPlacedVendorNotification($order, $vendorOrder));
        }
    }
}
