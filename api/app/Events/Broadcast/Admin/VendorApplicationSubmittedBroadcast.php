<?php

namespace App\Events\Broadcast\Admin;

use App\Support\Broadcast\BroadcastEventNames;

final class VendorApplicationSubmittedBroadcast extends AbstractAdminInboxBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::ADMIN_VENDOR_APPLICATION_SUBMITTED;
    }
}
