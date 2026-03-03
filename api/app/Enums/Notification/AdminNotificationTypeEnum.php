<?php

namespace App\Enums\Notification;

use App\Enums\BaseEnumTrait;

enum AdminNotificationTypeEnum: string
{
    use BaseEnumTrait;

    case ORDER_PLACED = 'order_placed';
    case USER_REGISTERED = 'user_registered';
    case TOURNAMENT_REQUEST_SUBMITTED = 'tournament_request_submitted';

    public function label(): string
    {
        return match ($this) {
            self::ORDER_PLACED => 'Order Placed',
            self::USER_REGISTERED => 'User Registered',
            self::TOURNAMENT_REQUEST_SUBMITTED => 'Tournament Request Submitted',
        };
    }
}
