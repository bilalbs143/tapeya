<?php

namespace App\Enums\Seamless\FourTen;

use App\Enums\BaseEnumTrait;

enum FourTenStatusCode
{
    use BaseEnumTrait;

    case NO_ERROR;
    case FAILURE;
    case NETWORK_OR_SERVER_COMMUNICATION_ERROR;
    case INVALID_TOKEN;
    case INVALID_REQUEST;
    case MISSING_TOKEN_VALUE;
    case MISSING_SIGNATURE_VALUE;
    case MISSING_REQUEST_ID_VALUE;
    case MISSING_GAME_ID_VALUE;
    case REQUEST_ID_ALREADY_PROCESSED;
    case ROUNDID_ALREADY_PROCESSED;
    case INSUFFICIENT_FUNDS;

    public function id(): int
    {
        return match ($this) {
            self::NO_ERROR => 0,
            self::FAILURE => 1,
            self::NETWORK_OR_SERVER_COMMUNICATION_ERROR => 3,
            self::INVALID_TOKEN => 1000,
            self::INVALID_REQUEST => 10000,
            self::MISSING_TOKEN_VALUE => 11000,
            self::MISSING_SIGNATURE_VALUE => 11001,
            self::MISSING_REQUEST_ID_VALUE => 11002,
            self::MISSING_GAME_ID_VALUE => 11003,
            self::REQUEST_ID_ALREADY_PROCESSED => 12002,
            self::ROUNDID_ALREADY_PROCESSED => 12003,
            self::INSUFFICIENT_FUNDS => 20000,
        };
    }

    public function message(): string
    {
        return match ($this) {
            self::NO_ERROR => 'Normal, Success',
            self::FAILURE => 'Failure',
            self::NETWORK_OR_SERVER_COMMUNICATION_ERROR => 'Network or Server Communication Error',
            self::INVALID_TOKEN => 'Invalid Token',
            self::INVALID_REQUEST => 'Invalid Request (Signature Verification Failed)',
            self::MISSING_TOKEN_VALUE => 'Missing token value',
            self::MISSING_SIGNATURE_VALUE => 'Missing signature value',
            self::MISSING_REQUEST_ID_VALUE => 'Missing request id Value',
            self::MISSING_GAME_ID_VALUE => 'Missing game_id value',
            self::REQUEST_ID_ALREADY_PROCESSED => 'request id already processed',
            self::ROUNDID_ALREADY_PROCESSED => 'roundid already processed',
            self::INSUFFICIENT_FUNDS => 'Insufficient Funds',
        };
    }
}
