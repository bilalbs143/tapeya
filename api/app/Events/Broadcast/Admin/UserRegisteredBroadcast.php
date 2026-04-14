<?php

namespace App\Events\Broadcast\Admin;

use App\Support\Broadcast\BroadcastEventNames;

final class UserRegisteredBroadcast extends AbstractAdminInboxBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::ADMIN_USER_REGISTERED;
    }
}
