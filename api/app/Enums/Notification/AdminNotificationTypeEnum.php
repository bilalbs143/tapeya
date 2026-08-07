<?php

namespace App\Enums\Notification;

use App\Enums\BaseEnumTrait;

enum AdminNotificationTypeEnum: string
{
    use BaseEnumTrait;

    case ORDER_PLACED = 'order_placed';
    case USER_REGISTERED = 'user_registered';
    case TOURNAMENT_REQUEST_SUBMITTED = 'tournament_request_submitted';
    case VENDOR_APPLICATION_SUBMITTED = 'vendor_application_submitted';
    case BROADCAST_CONCURRENCY_HIGH = 'broadcast_concurrency_high';
    case YOUTUBE_QUOTA_HIGH = 'youtube_quota_high';

    public function label(): string
    {
        return match ($this) {
            self::ORDER_PLACED => 'Order Placed',
            self::USER_REGISTERED => 'User Registered',
            self::TOURNAMENT_REQUEST_SUBMITTED => 'Tournament Request Submitted',
            self::VENDOR_APPLICATION_SUBMITTED => 'Vendor Application Submitted',
            self::BROADCAST_CONCURRENCY_HIGH => 'Broadcast Concurrency High',
            self::YOUTUBE_QUOTA_HIGH => 'YouTube Quota High',
        };
    }
}
