<?php

namespace App\Listeners;

use App\Events\VendorOrderStatusUpdated;
use App\Notifications\VendorOrderStatusUpdatedVendorNotification;

/**
 * Notify the selling vendor when their slice status changes (skip house and self-actor).
 */
class SendVendorOrderStatusUpdatedVendorNotification
{
    public function handle(VendorOrderStatusUpdated $event): void
    {
        $vendorOrder = $event->vendorOrder;
        $vendorOrder->loadMissing(['vendor.user']);

        $vendor = $vendorOrder->vendor;
        if ($vendor === null || $vendor->is_platform || $vendor->user === null) {
            return;
        }

        if ($event->actor !== null && (int) $event->actor->id === (int) $vendor->user_id) {
            return;
        }

        $vendor->user->notify(new VendorOrderStatusUpdatedVendorNotification($event));
    }
}
