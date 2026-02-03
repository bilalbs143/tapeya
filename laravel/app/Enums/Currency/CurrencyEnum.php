<?php

namespace App\Enums\Currency;

use App\Enums\BaseEnumTrait;

enum CurrencyEnum: string
{
    use BaseEnumTrait;

    case USD = 'usd';
    case KRW = 'krw';
    case IDR = 'idr';
}
