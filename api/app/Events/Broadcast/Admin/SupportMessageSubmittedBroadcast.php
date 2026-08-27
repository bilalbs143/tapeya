<?php

namespace App\Events\Broadcast\Admin;

use App\Support\Broadcast\BroadcastEventNames;

final class SupportMessageSubmittedBroadcast extends AbstractAdminInboxBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::ADMIN_SUPPORT_MESSAGE_SUBMITTED;
    }
}
