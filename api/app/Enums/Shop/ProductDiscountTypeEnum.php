<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum ProductDiscountTypeEnum: string
{
    use BaseEnumTrait;

    case PERCENTAGE = 'percentage';
    case FIXED = 'fixed';
}
