<?php

namespace App\Listeners;

use App\Models\User;
use App\Support\Broadcast\ResolveUserNotificationBroadcast;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Events\NotificationSent;

class BroadcastUserDatabaseNotification
{
    public function handle(NotificationSent $event): void
    {
        if ($event->channel !== 'database') {
            return;
        }

        $notifiable = $event->notifiable;
        if (! $notifiable instanceof User || $notifiable->isSystem()) {
            return;
        }

        $record = $event->response;
        if (! $record instanceof DatabaseNotification) {
            return;
        }

        $broadcast = ResolveUserNotificationBroadcast::resolve($notifiable, $record);
        if ($broadcast !== null) {
            broadcast($broadcast);
        }
    }
}
