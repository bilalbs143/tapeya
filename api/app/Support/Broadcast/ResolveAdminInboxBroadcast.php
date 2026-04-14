<?php

namespace App\Support\Broadcast;

use App\Events\Broadcast\Admin\OrderPlacedBroadcast;
use App\Events\Broadcast\Admin\TournamentRequestSubmittedBroadcast;
use App\Events\Broadcast\Admin\UserRegisteredBroadcast;
use App\Notifications\OrderPlacedAdminNotification;
use App\Notifications\TournamentRequestSubmittedAdminNotification;
use App\Notifications\UserRegisteredAdminNotification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\DatabaseNotification;

/**
 * Maps a persisted System-user (admin inbox) database notification to a specific broadcast event.
 */
final class ResolveAdminInboxBroadcast
{
    public static function resolve(DatabaseNotification $record): ?ShouldBroadcast
    {
        $notificationId = (string) $record->getKey();
        $notificationType = (string) $record->type;
        $data = is_array($record->data) ? $record->data : [];

        return match ($notificationType) {
            OrderPlacedAdminNotification::class => new OrderPlacedBroadcast(
                $notificationId,
                $notificationType,
                $data,
            ),
            TournamentRequestSubmittedAdminNotification::class => new TournamentRequestSubmittedBroadcast(
                $notificationId,
                $notificationType,
                $data,
            ),
            UserRegisteredAdminNotification::class => new UserRegisteredBroadcast(
                $notificationId,
                $notificationType,
                $data,
            ),
            default => null,
        };
    }
}
