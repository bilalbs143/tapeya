<?php

namespace App\Events\Broadcast\User;

use App\Support\Broadcast\BroadcastEventNames;

final class OrderPlacedBroadcast extends AbstractUserBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::USER_ORDER_PLACED;
    }
}
