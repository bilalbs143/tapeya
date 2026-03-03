<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum OrderStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case DISPATCHED = 'dispatched';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PROCESSING => 'Processing',
            self::DISPATCHED => 'Dispatched',
            self::DELIVERED => 'Delivered',
            self::CANCELLED => 'Cancelled',
        };
    }
}
