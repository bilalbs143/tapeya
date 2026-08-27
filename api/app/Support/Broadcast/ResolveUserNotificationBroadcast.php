<?php

namespace App\Support\Broadcast;

use App\Events\Broadcast\User\OrderPlacedBroadcast;
use App\Events\Broadcast\User\OrderStatusUpdatedBroadcast;
use App\Events\Broadcast\User\PostEngagementBroadcast;
use App\Models\User;
use App\Notifications\OrderPlacedUserNotification;
use App\Notifications\OrderPlacedVendorNotification;
use App\Notifications\OrderStatusUpdatedUserNotification;
use App\Notifications\PostCommentedUserNotification;
use App\Notifications\PostCommentLikedUserNotification;
use App\Notifications\PostCommentReplyUserNotification;
use App\Notifications\PostLikedUserNotification;
use App\Notifications\PostMentionedUserNotification;
use App\Notifications\PostPublishedFollowerNotification;
use App\Notifications\PostRepostedUserNotification;
use App\Notifications\UserFollowedUserNotification;
use App\Notifications\UserReferredUserNotification;
use App\Notifications\VendorOrderStatusUpdatedVendorNotification;
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
            OrderPlacedUserNotification::class,
            OrderPlacedVendorNotification::class => new OrderPlacedBroadcast(
                $user->getKey(),
                $notificationId,
                $notificationType,
                $data,
            ),
            OrderStatusUpdatedUserNotification::class,
            VendorOrderStatusUpdatedVendorNotification::class => new OrderStatusUpdatedBroadcast(
                $user->getKey(),
                $notificationId,
                $notificationType,
                $data,
            ),
            PostLikedUserNotification::class,
            PostCommentedUserNotification::class,
            PostCommentReplyUserNotification::class,
            PostCommentLikedUserNotification::class,
            PostMentionedUserNotification::class,
            PostRepostedUserNotification::class,
            PostPublishedFollowerNotification::class,
            UserFollowedUserNotification::class,
            UserReferredUserNotification::class => new PostEngagementBroadcast(
                $user->getKey(),
                $notificationId,
                $notificationType,
                $data,
            ),
            default => null,
        };
    }
}
