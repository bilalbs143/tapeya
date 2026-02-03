<?php

namespace App\Utils\Services\Companies\Seamless;

use App\Facades\CompanyRequest;
use App\Models\Transaction;
use App\Models\User;

abstract class BaseSeamlessService
{
    public static function getUserRecord(?User $user = null): User
    {
        return $user ?? CompanyRequest::getUser();
    }

    public static function verifyAuth(): bool
    {
        if (CompanyRequest::hasNotUser()) {
            return false;
        }

        CompanyRequest::startSession();

        return true;
    }

    public static function isUserActive(): bool
    {
        return CompanyRequest::isUserActive();
    }

    public static function getHoldingMoney(): float
    {
        return CompanyRequest::holdingMoney();
    }

    public static function verifyBetAmount(float $betAmount): bool
    {
        $userBalance = self::getHoldingMoney();
        $betAmount = (float) $betAmount;

        return $userBalance >= $betAmount;
    }

    public static function transactionExists(string $transactionId): bool
    {
        return Transaction::byTxnId($transactionId)->exists();
    }

    public static function roundExists(string $roundId): bool
    {
        return Transaction::byRoundId($roundId)->exists();
    }
}
