<?php

namespace App\Events\Broadcast\Admin;

use App\Support\Broadcast\BroadcastEventNames;

final class TournamentRequestSubmittedBroadcast extends AbstractAdminInboxBroadcastEvent
{
    public function broadcastAs(): string
    {
        return BroadcastEventNames::ADMIN_TOURNAMENT_REQUEST_SUBMITTED;
    }
}
