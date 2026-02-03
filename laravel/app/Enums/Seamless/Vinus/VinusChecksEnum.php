<?php

namespace App\Enums\Seamless\Vinus;

use App\Enums\BaseEnumTrait;

enum VinusChecksEnum: int
{
    use BaseEnumTrait;

    case CHECK_TOKEN = 11;
    case CHECK_USER_EXISTS = 21;
    case CHECK_USER_IS_ACTIVE = 22;
    case CHECK_USER_HAS_MORE_THAN_THE_AMOUNT_TO_BET = 31;
    case CHECK_TRANSACTION_HAS_ALREADY_BEEN_PROCESSED = 41;
    case CHECK_IF_THERE_ARE_PROCESSED_TRANSACTIONS = 42;

    public function id(): int
    {
        return $this->value;
    }
}
