<?php

namespace App\Events\Broadcast\User;

use App\Support\Broadcast\BroadcastEventNames;

final class OrderStatusUpdatedBroadcast extends AbstractUserBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::USER_ORDER_STATUS_UPDATED;
    }
}
