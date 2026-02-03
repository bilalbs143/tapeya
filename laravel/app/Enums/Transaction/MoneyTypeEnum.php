<?php

namespace App\Enums\Transaction;

use App\Enums\BaseEnumTrait;

enum MoneyTypeEnum: string
{
    use BaseEnumTrait;

    case MONEY = 'money';
    case POINTS = 'points';
    case COUPON_POINTS = 'coupon_points';
    case LOSING_MONEY = 'losing_money';
    case ROLLING_MONEY = 'rolling_money';

    public static function withLabels(): array
    {
        $valuesWithLabels = [];

        foreach (self::cases() as $case) {
            $valuesWithLabels[$case->value] = [
                'label' => $case->label(),
                'categories' => $case->categories(),
                'types' => $case->types(),
                'sources' => $case->sources(),
            ];
        }

        return $valuesWithLabels;
    }

    public function categories()
    {
        return match ($this) {
            self::MONEY => [
                [TransactionCategoryEnum::CONVERTED_COUPON_POINTS_TO_MONEY->value => TransactionCategoryEnum::CONVERTED_COUPON_POINTS_TO_MONEY->label()],
                [TransactionCategoryEnum::CONVERTED_POINTS_TO_MONEY->value => TransactionCategoryEnum::CONVERTED_POINTS_TO_MONEY->label()],
                [TransactionCategoryEnum::ADMINISTRATOR_MANUAL_RECOVERY->value => TransactionCategoryEnum::ADMINISTRATOR_MANUAL_RECOVERY->label()],
                [TransactionCategoryEnum::ADMINISTRATOR_MANUAL_PAYMENT->value => TransactionCategoryEnum::ADMINISTRATOR_MANUAL_PAYMENT->label()],
                [TransactionCategoryEnum::MONEY_DEPOSITED->value => TransactionCategoryEnum::MONEY_DEPOSITED->label()],
                [TransactionCategoryEnum::MONEY_WITHDRAWAL->value => TransactionCategoryEnum::MONEY_WITHDRAWAL->label()],
                [TransactionCategoryEnum::GAME_BET_MONEY->value => TransactionCategoryEnum::GAME_BET_MONEY->label()],
                [TransactionCategoryEnum::GAME_BET_WIN_MONEY->value => TransactionCategoryEnum::GAME_BET_WIN_MONEY->label()],
                [TransactionCategoryEnum::GAME_REFUNDED_MONEY->value => TransactionCategoryEnum::GAME_REFUNDED_MONEY->label()],
                [TransactionCategoryEnum::GAME_CANCELED_MONEY->value => TransactionCategoryEnum::GAME_CANCELED_MONEY->label()],
                [TransactionCategoryEnum::GAME_JACKPOT_MONEY->value => TransactionCategoryEnum::GAME_JACKPOT_MONEY->label()],
                [TransactionCategoryEnum::GAME_BONUS_MONEY->value => TransactionCategoryEnum::GAME_BONUS_MONEY->label()],
                [TransactionCategoryEnum::GAME_PROMO_WIN_MONEY->value => TransactionCategoryEnum::GAME_PROMO_WIN_MONEY->label()],
            ],
            self::POINTS => [
                [TransactionCategoryEnum::CONVERTED_POINTS_TO_MONEY->value => TransactionCategoryEnum::CONVERTED_POINTS_TO_MONEY->label()],
                [TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_RECOVERY->value => TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_RECOVERY->label()],
                [TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_PAYMENT->value => TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_PAYMENT->label()],
                [TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_AFTER_SIGNUP->value => TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_AFTER_SIGNUP->label()],
                [TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_OF_DAY->value => TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_OF_DAY->label()],
                [TransactionCategoryEnum::PER_RECHARGE_BONUS_POINTS->value => TransactionCategoryEnum::PER_RECHARGE_BONUS_POINTS->label()],
                [TransactionCategoryEnum::WEEKLY_LOSS_BONUS->value => TransactionCategoryEnum::WEEKLY_LOSS_BONUS->label()],
                [TransactionCategoryEnum::PROMOTION_POINTS->value => TransactionCategoryEnum::PROMOTION_POINTS->label()],
            ],
            self::COUPON_POINTS => [
                [TransactionCategoryEnum::CONVERTED_COUPON_POINTS_TO_MONEY->value => TransactionCategoryEnum::CONVERTED_COUPON_POINTS_TO_MONEY->label()],
                [TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_RECOVERY->value => TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_RECOVERY->label()],
                [TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_PAYMENT->value => TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_PAYMENT->label()],
                [TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_RECOVERY->value => TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_RECOVERY->label()],
                [TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_PAYMENT->value => TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_PAYMENT->label()],
                [TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_RECOVERY->value => TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_RECOVERY->label()],
                [TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_PAYMENT->value => TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_PAYMENT->label()],
            ],
            self::LOSING_MONEY => [
                [TransactionCategoryEnum::LOSING_MONEY_DISTRIBUTED->value => TransactionCategoryEnum::LOSING_MONEY_DISTRIBUTED->label()],
                [TransactionCategoryEnum::LOSING_MONEY_WITHDRAWAL->value => TransactionCategoryEnum::LOSING_MONEY_WITHDRAWAL->label()],
                [TransactionCategoryEnum::LOSING_MONEY_DEBITED->value => TransactionCategoryEnum::LOSING_MONEY_DEBITED->label()],
            ],
            self::ROLLING_MONEY => [
                [TransactionCategoryEnum::ROLLING_MONEY_DISTRIBUTED->value => TransactionCategoryEnum::ROLLING_MONEY_DISTRIBUTED->label()],
                [TransactionCategoryEnum::ROLLING_MONEY_WITHDRAWAL->value => TransactionCategoryEnum::ROLLING_MONEY_WITHDRAWAL->label()],
            ],
        };
    }

    public function types()
    {
        return match ($this) {
            self::MONEY => [
                [TransactionTypeEnum::DEPOSIT->value => TransactionTypeEnum::DEPOSIT->label()],
                [TransactionTypeEnum::MONEY_CREDITED->value => TransactionTypeEnum::MONEY_CREDITED->label()],
                [TransactionTypeEnum::WITHDRAW->value => TransactionTypeEnum::WITHDRAW->label()],
                [TransactionTypeEnum::MONEY_DEBITED->value => TransactionTypeEnum::MONEY_DEBITED->label()],
            ],
            self::POINTS => [
                [TransactionTypeEnum::POINTS_EXCHANGE->value => TransactionTypeEnum::POINTS_EXCHANGE->label()],
                [TransactionTypeEnum::POINTS_CREDITED->value => TransactionTypeEnum::POINTS_CREDITED->label()],
                [TransactionTypeEnum::POINTS_DEBITED->value => TransactionTypeEnum::POINTS_DEBITED->label()],
            ],
            self::COUPON_POINTS => [
                [TransactionTypeEnum::COUPON_POINTS_EXCHANGE->value => TransactionTypeEnum::COUPON_POINTS_EXCHANGE->label()],
                [TransactionTypeEnum::COUPON_POINTS_CREDITED->value => TransactionTypeEnum::COUPON_POINTS_CREDITED->label()],
                [TransactionTypeEnum::COUPON_POINTS_DEBITED->value => TransactionTypeEnum::COUPON_POINTS_DEBITED->label()],
            ],
            self::LOSING_MONEY => [
                [TransactionTypeEnum::LOSING_MONEY_CREDITED->value => TransactionTypeEnum::LOSING_MONEY_CREDITED->label()],
                [TransactionTypeEnum::LOSING_MONEY_DEBITED->value => TransactionTypeEnum::LOSING_MONEY_DEBITED->label()],
                [TransactionTypeEnum::WITHDRAW_LOSING_MONEY->value => TransactionTypeEnum::WITHDRAW_LOSING_MONEY->label()],
            ],
            self::ROLLING_MONEY => [
                [TransactionTypeEnum::ROLLING_MONEY_CREDITED->value => TransactionTypeEnum::ROLLING_MONEY_CREDITED->label()],
                [TransactionTypeEnum::WITHDRAW_ROLLING_MONEY->value => TransactionTypeEnum::WITHDRAW_ROLLING_MONEY->label()],
            ],
        };
    }

    public function sources()
    {
        return match ($this) {
            self::MONEY => [
                [TransactionSourceEnum::MANUAL_PAYMENT->value => TransactionSourceEnum::MANUAL_PAYMENT->label()],
                [TransactionSourceEnum::MANUAL_RECOVERY->value => TransactionSourceEnum::MANUAL_RECOVERY->label()],
                [TransactionSourceEnum::DEPOSIT_BONUS->value => TransactionSourceEnum::DEPOSIT_BONUS->label()],
                [TransactionSourceEnum::GAME->value => TransactionSourceEnum::GAME->label()],
            ],
            self::POINTS => [
                [TransactionSourceEnum::MANUAL_POINTS_PAYMENT->value => TransactionSourceEnum::MANUAL_POINTS_PAYMENT->label()],
                [TransactionSourceEnum::MANUAL_POINTS_RECOVERY->value => TransactionSourceEnum::MANUAL_POINTS_RECOVERY->label()],
            ],
            self::COUPON_POINTS => [
                [TransactionSourceEnum::MANUAL_COUPON_POINTS_PAYMENT->value => TransactionSourceEnum::MANUAL_COUPON_POINTS_PAYMENT->label()],
                [TransactionSourceEnum::MANUAL_COUPON_POINTS_RECOVERY->value => TransactionSourceEnum::MANUAL_COUPON_POINTS_RECOVERY->label()],
            ],
            self::LOSING_MONEY => [
                [TransactionSourceEnum::BET->value => TransactionSourceEnum::BET->label()],
            ],
            self::ROLLING_MONEY => [
                [TransactionSourceEnum::BET->value => TransactionSourceEnum::BET->label()],
            ],
        };
    }
}
