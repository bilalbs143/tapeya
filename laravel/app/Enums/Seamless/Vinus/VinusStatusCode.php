<?php

namespace App\Enums\Seamless\Vinus;

use App\Enums\BaseEnumTrait;

enum VinusStatusCode
{
    use BaseEnumTrait;

    case NO_ERROR;
    case AUTHENTICATION_ERROR;
    case VALIDATION_ERRORS;
    case NO_FUNDS;
    case TRANSACTION_RECORD_NOT_FOUND;
    case TRANSACTION_HAS_ALREADY_BEEN_PROCESSED;
    case SERVER_SIDE_ERROR;

    public function id(): int
    {
        return match ($this) {
            self::NO_ERROR => 0,
            self::AUTHENTICATION_ERROR => 11,
            self::VALIDATION_ERRORS => 11,
            self::NO_FUNDS => 31,
            self::TRANSACTION_RECORD_NOT_FOUND => 1014,
            self::TRANSACTION_HAS_ALREADY_BEEN_PROCESSED => 41,
            self::SERVER_SIDE_ERROR => 100,
        };
    }
}
