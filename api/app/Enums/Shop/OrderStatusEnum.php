<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum OrderStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';
}
