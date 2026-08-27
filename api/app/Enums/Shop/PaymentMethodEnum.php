<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum PaymentMethodEnum: string
{
    use BaseEnumTrait;

    case COD = 'cod';

    public function label(): string
    {
        return match ($this) {
            self::COD => 'Cash On Delivery',
        };
    }
}
