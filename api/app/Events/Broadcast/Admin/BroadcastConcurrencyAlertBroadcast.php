<?php

namespace App\Events\Broadcast\Admin;

use App\Support\Broadcast\BroadcastEventNames;

final class BroadcastConcurrencyAlertBroadcast extends AbstractAdminInboxBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::ADMIN_BROADCAST_CONCURRENCY_HIGH;
    }
}
