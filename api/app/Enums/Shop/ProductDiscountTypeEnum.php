<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum ProductDiscountTypeEnum: string
{
    use BaseEnumTrait;

    case PERCENTAGE = 'percentage';
    case FIXED = 'fixed';

    public function label(): string
    {
        return match ($this) {
            self::PERCENTAGE => 'Percentage',
            self::FIXED => 'Fixed',
        };
    }
}
