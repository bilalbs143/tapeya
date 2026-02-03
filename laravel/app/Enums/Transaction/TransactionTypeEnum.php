<?php

namespace App\Enums\Transaction;

use App\Enums\BaseEnumTrait;
use App\Enums\SoundSettings\SoundSettingsTypeEnum;

enum TransactionTypeEnum: string
{
    use BaseEnumTrait;

    case DEPOSIT = 'deposit';
    case MONEY_CREDITED = 'money_credited';
    case WITHDRAW = 'withdraw';
    case MONEY_DEBITED = 'money_debited';
    case POINTS_EXCHANGE = 'points_exchange';
    case POINTS_CREDITED = 'points_credited';
    case POINTS_DEBITED = 'points_debited';
    case COUPON_POINTS_EXCHANGE = 'coupon_points_exchange';
    case COUPON_POINTS_CREDITED = 'coupon_points_credited';
    case COUPON_POINTS_DEBITED = 'coupon_points_debited';
    case ROLLING_MONEY_CREDITED = 'rolling_money_credited';
    case WITHDRAW_ROLLING_MONEY = 'withdraw_rolling_money';
    case LOSING_MONEY_DEBITED = 'losing_money_debited';
    case LOSING_MONEY_CREDITED = 'losing_money_credited';
    case WITHDRAW_LOSING_MONEY = 'withdraw_losing_money';

    public function getSymbol()
    {
        return match ($this) {
            self::DEPOSIT, self::POINTS_CREDITED, self::COUPON_POINTS_CREDITED, self::MONEY_CREDITED, self::ROLLING_MONEY_CREDITED, self::LOSING_MONEY_CREDITED => '+',
            self::WITHDRAW, self::POINTS_DEBITED, self::COUPON_POINTS_DEBITED, self::MONEY_DEBITED, self::POINTS_EXCHANGE, self::COUPON_POINTS_EXCHANGE, self::WITHDRAW_ROLLING_MONEY, self::WITHDRAW_LOSING_MONEY, self::LOSING_MONEY_DEBITED => '-',
            default => ''
        };
    }

    public function soundType()
    {
        return match ($this) {
            self::DEPOSIT => SoundSettingsTypeEnum::RECHARGE_REQUEST,
            self::WITHDRAW => SoundSettingsTypeEnum::WITHDRAW_REQUEST,
            self::WITHDRAW_LOSING_MONEY => SoundSettingsTypeEnum::WITHDRAW_LOSING_MONEY,
            self::WITHDRAW_ROLLING_MONEY => SoundSettingsTypeEnum::WITHDRAW_ROLLING_MONEY,
        };
    }
}
