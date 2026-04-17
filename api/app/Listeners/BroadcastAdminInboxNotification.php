<?php

namespace App\Listeners;

use App\Models\User;
use App\Support\Broadcast\ResolveAdminInboxBroadcast;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Events\NotificationSent;
use Throwable;

class BroadcastAdminInboxNotification
{
    public function handle(NotificationSent $event): void
    {
        if ($event->channel !== 'database') {
            return;
        }

        $notifiable = $event->notifiable;
        if (! $notifiable instanceof User || ! $notifiable->isSystem()) {
            return;
        }

        $record = $event->response;
        if (! $record instanceof DatabaseNotification) {
            return;
        }

        $broadcast = ResolveAdminInboxBroadcast::resolve($record);
        if ($broadcast !== null) {
            try {
                broadcast($broadcast);
            } catch (Throwable $e) {
                report($e);
            }
        }
    }
}
