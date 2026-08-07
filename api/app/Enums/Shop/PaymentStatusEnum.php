<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum PaymentStatusEnum: string
{
    use BaseEnumTrait;

    case UNPAID = 'unpaid';
    case ADVANCE = 'advance';
    case PAID = 'paid';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::UNPAID => 'Unpaid',
            self::ADVANCE => 'Advance',
            self::PAID => 'Paid',
            self::REFUNDED => 'Refunded',
        };
    }
}
