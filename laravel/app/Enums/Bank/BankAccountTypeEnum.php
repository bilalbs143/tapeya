<?php

namespace App\Enums\Bank;

use App\Enums\BaseEnumTrait;

enum BankAccountTypeEnum: string
{
    use BaseEnumTrait;

    case DIGITAL_WALLET = 'digital_wallet';
    case BANK = 'bank';
    case PULSA = 'pulsa';
}
