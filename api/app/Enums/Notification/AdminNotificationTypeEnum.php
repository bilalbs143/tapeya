<?php

namespace App\Enums\Notification;

use App\Enums\BaseEnumTrait;

enum AdminNotificationTypeEnum: string
{
    use BaseEnumTrait;

    case ORDER_PLACED = 'order_placed';
    case USER_REGISTERED = 'user_registered';
    case EVENT_REQUEST_SUBMITTED = 'event_request_submitted';
}
