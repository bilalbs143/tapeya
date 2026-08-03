<?php

namespace App\Enums\Push;

use App\Enums\BaseEnumTrait;

enum NotificationEventEnum: string
{
    use BaseEnumTrait;

    case ORDER_PLACED = 'order_placed';
    case ORDER_STATUS_UPDATED = 'order_status_updated';
    case ORDER_DELIVERED = 'order_delivered';
    case MANUAL_BROADCAST = 'manual_broadcast';
    case POST_LIKED = 'post_liked';
    case POST_COMMENTED = 'post_commented';
    case POST_COMMENT_REPLY = 'post_comment_reply';
    case POST_COMMENT_LIKED = 'post_comment_liked';
    case POST_MENTIONED = 'post_mentioned';
    case POST_REPOSTED = 'post_reposted';
    case POST_PUBLISHED = 'post_published';
    case USER_FOLLOWED = 'user_followed';
    case USER_REFERRED = 'user_referred';

    public function label(): string
    {
        return match ($this) {
            self::ORDER_PLACED => 'Order Placed',
            self::ORDER_STATUS_UPDATED => 'Order Status Updated',
            self::ORDER_DELIVERED => 'Order Delivered',
            self::MANUAL_BROADCAST => 'Manual Broadcast',
            self::POST_LIKED => 'Post Liked',
            self::POST_COMMENTED => 'Post Commented',
            self::POST_COMMENT_REPLY => 'Post Comment Reply',
            self::POST_COMMENT_LIKED => 'Post Comment Liked',
            self::POST_MENTIONED => 'Post Mention',
            self::POST_REPOSTED => 'Post Reposted',
            self::POST_PUBLISHED => 'Post Published',
            self::USER_FOLLOWED => 'User Followed',
            self::USER_REFERRED => 'User Referred',
        };
    }
}
