<?php

namespace App\Enums\Transaction;

use App\Enums\BaseEnumTrait;

enum ExchangeRequestViaEnum: string
{
    use BaseEnumTrait;

    case BANK_TRANSFER = 'bank_transfer';
    case CRYPTO = 'crypto';
    case CARD = 'card';
}
