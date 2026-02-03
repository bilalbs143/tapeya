<?php

namespace App\Enums\TransactionResult;

use App\Enums\BaseEnumTrait;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\Transaction;
use App\Models\TransactionResult;

enum TransactionResultState: string
{
    use BaseEnumTrait;

    case BET = 'bet';
    case WIN = 'win';
    case LOSE = 'lose';
    case REFUNDED = 'refunded';
    case CANCELED = 'canceled';
    case DRAW = 'draw';

    public static function getState(Transaction $transaction): self
    {
        if ($transaction->isBet()) {
            return self::BET;
        }

        if ($transaction->isWin()) {
            return self::WIN;
        }

        if ($transaction->isRefund()) {
            return self::REFUNDED;
        }

        if ($transaction->isCancel()) {
            return self::CANCELED;
        }

        return self::BET;
    }

    public static function getFinalResult(TransactionResult $transaction): self
    {
        $winAmount = $transaction->transactions->where('type', TransactionTypeEnum::MONEY_CREDITED)->where('category', TransactionCategoryEnum::GAME_BET_WIN_MONEY)->sum('money');
        $betAmount = $transaction->transactions->where('type', TransactionTypeEnum::MONEY_DEBITED)->where('category', TransactionCategoryEnum::GAME_BET_MONEY)->sum('money');

        if ($winAmount > 0) {
            return self::WIN;
        }

        return self::LOSE;

        // No needed
        $winAmount = $winAmount - $betAmount;

        if ($winAmount > 0) {
            return self::WIN;
        }

        if ($winAmount < 0) {
            return self::LOSE;
        }

        return self::DRAW;
    }
}
