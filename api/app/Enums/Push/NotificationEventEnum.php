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

    public function label(): string
    {
        return match ($this) {
            self::ORDER_PLACED => 'Order Placed',
            self::ORDER_STATUS_UPDATED => 'Order Status Updated',
            self::ORDER_DELIVERED => 'Order Delivered',
            self::MANUAL_BROADCAST => 'Manual Broadcast',
        };
    }
}
