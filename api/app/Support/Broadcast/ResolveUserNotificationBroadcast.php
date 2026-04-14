<?php

namespace App\Support\Broadcast;

use App\Events\Broadcast\User\OrderPlacedBroadcast;
use App\Events\Broadcast\User\OrderStatusUpdatedBroadcast;
use App\Models\User;
use App\Notifications\OrderPlacedUserNotification;
use App\Notifications\OrderStatusUpdatedUserNotification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\DatabaseNotification;

/**
 * Maps a persisted user database notification to a specific broadcast event.
 */
final class ResolveUserNotificationBroadcast
{
    public static function resolve(User $user, DatabaseNotification $record): ?ShouldBroadcast
    {
        $notificationId = (string) $record->getKey();
        $notificationType = (string) $record->type;
        $data = is_array($record->data) ? $record->data : [];

        return match ($notificationType) {
            OrderPlacedUserNotification::class => new OrderPlacedBroadcast(
                $user->getKey(),
                $notificationId,
                $notificationType,
                $data,
            ),
            OrderStatusUpdatedUserNotification::class => new OrderStatusUpdatedBroadcast(
                $user->getKey(),
                $notificationId,
                $notificationType,
                $data,
            ),
            default => null,
        };
    }
}
