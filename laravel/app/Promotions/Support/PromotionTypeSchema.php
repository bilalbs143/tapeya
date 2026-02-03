<?php

namespace App\Promotions\Support;

use App\Enums\Promotion\PromotionTypeEnum;

class PromotionTypeSchema
{
    public static function all(): array
    {
        $types = [];
        foreach (PromotionTypeEnum::cases() as $case) {
            $types[$case->value] = [
                'key' => $case->value,
                'type_enum' => $case->name,
                'label' => __("terms.{$case->value}"),
                'config_schema' => self::schemaFor($case),
                'formula' => self::formulaFor($case),
            ];
        }

        return $types;
    }

    public static function schemaFor(PromotionTypeEnum $type): array
    {
        return match ($type) {
            PromotionTypeEnum::SLOTS_DEPOSIT => [
                field('min_deposit', 'MIN_DEPOSIT', 'number', true),
                field('max_bonus', 'MAX_BONUS', 'number', true),
                field('bonus_percentage', 'BONUS_PERCENTAGE', 'number', true, 1),
                field('to_multiplier', 'TO_MULTIPLIER', 'number', true, 22),
                field('expiry_after_activation_hours', 'EXPIRY_HOURS', 'number', false),
            ],
            PromotionTypeEnum::CASINO_STREAK => [
                field('stake_min', 'STAKE_MIN', 'number', true),
                field('stake_max', 'STAKE_MAX', 'number', false),
                field('streak_length', 'STREAK_LENGTH', 'number', true, 8),
                field('bonus_percentage', 'BONUS_PERCENTAGE', 'number', true, 25),
            ],
            PromotionTypeEnum::SLOTS_CASHBACK_COMMISSION => [
                field('cashback_percentage', 'CASHBACK_PERCENTAGE', 'number', true, 5),
                field('commission_percentage', 'COMMISSION_PERCENTAGE', 'number', true, 0.5),
                field('min_payout', 'MIN_PAYOUT', 'number', false),
            ],
            PromotionTypeEnum::SPORTS_CASHBACK_COMMISSION => [
                field('cashback_percentage', 'CASHBACK_PERCENTAGE', 'number', true, 5),
                field('commission_percentage', 'COMMISSION_PERCENTAGE', 'number', true, 0.5),
                field('min_payout', 'MIN_PAYOUT', 'number', true, 10000),
                field('odds_thresholds_dec', 'ODDS_THRESHOLD_DEC', 'number', true, 1.7),
            ],
            PromotionTypeEnum::POKER_RAKEBACK => [
                field('rakeback_percentage', 'RAKEBACK_PERCENTAGE', 'number', true, 0.3),
                field('min_payout', 'MIN_PAYOUT', 'number', true, 10000),
            ],
            PromotionTypeEnum::ARCADE_CASHBACK => [
                field('cashback_percentage', 'CASHBACK_PERCENTAGE', 'number', true, 5),
                field('min_payout', 'MIN_PAYOUT', 'number', true, 50000),
                field('max_payout', 'MAX_PAYOUT', 'number', true, 10000000),
            ],
            PromotionTypeEnum::CASINO_COMMISSION => [
                field('commission_percentage', 'COMMISSION_PERCENTAGE', 'number', true, 0.5),
            ],
            PromotionTypeEnum::LOSS_GUARANTEE => [
                field('min_deposit', 'MIN_DEPOSIT', 'number', true, 50000),
                field('max_guarantee', 'MAX_GUARANTEE', 'number', true, 100000),
                field('claim_to_multiplier', 'CLAIM_TO_MULTIPLIER', 'number', true, 2),
                field('withdraw_multiplier', 'WITHDRAW_MULTIPLIER', 'number', true, 4),
                field('max_withdrawable', 'MAX_WITHDRAWABLE', 'number', true, 1000000),
                field('allowed_providers', 'ALLOWED_PROVIDERS', 'text', false, null, 'csv'),
            ],
            PromotionTypeEnum::SABUNG_CASHBACK => [
                field('cashback_percentage', 'CASHBACK_PERCENTAGE', 'number', true, 5),
                field('min_payout', 'MIN_PAYOUT', 'number', true, 25000),
            ],
        };
    }

    public static function formulaFor(PromotionTypeEnum $type): string
    {
        return match ($type) {
            PromotionTypeEnum::SLOTS_DEPOSIT => 'Step 1: Bonus = min(Min Deposit × Bonus Percentage, Max Bonus).<br>Step 2: TO required = (Min Deposit + Bonus) × TO Multiplier.<br>Final credit after TO met = Bonus.',
            PromotionTypeEnum::CASINO_STREAK => 'Step 1: Achieve Streak Length consecutive win/lose tickets within day_window.<br>Step 2: Total Stake = sum(Stakes in streak).<br>Step 3: Bonus = Total Stake × Bonus Percentage.<br>Final credit = Bonus.',
            PromotionTypeEnum::SLOTS_CASHBACK_COMMISSION => 'Step 1: Commission = Weekly Turnover × Commission Percentage.<br>Step 2: Cashback Base = max(Weekly Net Loss – Commission, 0).<br>Step 3: Cashback = Cashback Base × Cashback Percentage.<br>Final payout = Commission + Cashback (Min Payout if set).',
            PromotionTypeEnum::SPORTS_CASHBACK_COMMISSION => 'Step 1: Commission = Qualifying Turnover × Commission Percentage (only bets above Odds Threshold).<br>Step 2: Cashback Base = max(Weekly Net Loss – Commission, 0).<br>Step 3: Cashback = Cashback Base × Cashback Percentage.<br>Final payout = Commission + Cashback (apply Min Payout).',
            PromotionTypeEnum::POKER_RAKEBACK => 'Step 1: Rakeback = Weekly Rake/Turnover × Rakeback Percentage.<br>Step 2: Pay only if Rakeback ≥ Min Payout (else 0).<br>Final payout = Rakeback (subject to Min Payout).',
            PromotionTypeEnum::ARCADE_CASHBACK => 'Step 1: Raw Cashback = Weekly Turnover × Cashback Percentage.<br>Step 2: Clamp between Min Payout and Max Payout.<br>Final payout = Clamped Cashback.',
            PromotionTypeEnum::CASINO_COMMISSION => 'Step 1: Bonus = Weekly Casino Turnover × Commission Percentage.<br>Final payout = Bonus.',
            PromotionTypeEnum::LOSS_GUARANTEE => 'Step 1: Loss = max(-Net Win/Loss, 0).<br>Step 2: Guarantee = min(Loss, Max Guarantee) after meeting Min Deposit × Claim TO Multiplier.<br>Step 3: Withdraw when Balance ≥ (Min Deposit + Guarantee) × Withdraw Multiplier (capped at Max Withdrawable).<br>Final credit = Guarantee; withdrawals capped by Max Withdrawable.',
            PromotionTypeEnum::SABUNG_CASHBACK => 'Step 1: Cashback = Weekly Turnover × Cashback Percentage.<br>Step 2: Ensure payout ≥ Min Payout.<br>Final payout = max(Cashback, Min Payout).',
        };
    }
}

function field(
    string $name,
    string $labelKey,
    string $control,
    bool $required = false,
    mixed $default = null,
    ?string $format = null
): array {
    return [
        'name' => $name,
        'label_key' => $labelKey,
        'control' => $control,
        'required' => $required,
        'default' => $default,
        'format' => $format,
    ];
}
