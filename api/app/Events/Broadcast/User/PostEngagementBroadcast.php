<?php

namespace App\Events\Broadcast\User;

use App\Support\Broadcast\BroadcastEventNames;

final class PostEngagementBroadcast extends AbstractUserBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::USER_POST_ENGAGEMENT;
    }
}
