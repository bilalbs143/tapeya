<?php

namespace App\Enums\Transaction;

use App\Enums\BaseEnumTrait;

enum TransactionCategoryEnum: string
{
    use BaseEnumTrait;

    case CONVERTED_COUPON_POINTS_TO_MONEY = 'converted_coupon_points_to_money';
    case CONVERTED_POINTS_TO_MONEY = 'converted_points_to_money';
    case ADMINISTRATOR_MANUAL_RECOVERY = 'administrator_manual_recovery';
    case ADMINISTRATOR_MANUAL_PAYMENT = 'administrator_manual_payment';
    case ADMINISTRATOR_MANUAL_POINTS_RECOVERY = 'administrator_manual_points_recovery';
    case ADMINISTRATOR_MANUAL_POINTS_PAYMENT = 'administrator_manual_points_payment';
    case ADMINISTRATOR_MANUAL_COUPON_POINTS_RECOVERY = 'administrator_manual_coupon_points_recovery';
    case ADMINISTRATOR_MANUAL_COUPON_POINTS_PAYMENT = 'administrator_manual_coupon_points_payment';
    case AGENT_MANUAL_COUPON_POINTS_RECOVERY = 'agent_manual_coupon_points_recovery';
    case AGENT_MANUAL_COUPON_POINTS_PAYMENT = 'agent_manual_coupon_points_payment';
    case AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_RECOVERY = 'agent_manual_coupon_points_distribution_recovery';
    case AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_PAYMENT = 'agent_manual_coupon_points_distribution_payment';
    case FIRST_RECHARGE_BONUS_POINTS_AFTER_SIGNUP = 'first_recharge_bonus_points_after_signup';
    case FIRST_RECHARGE_BONUS_POINTS_OF_DAY = 'first_recharge_bonus_points_of_day';
    case PER_RECHARGE_BONUS_POINTS = 'per_recharge_bonus_points';
    case GAME_BET_MONEY = 'game_bet_money';
    case GAME_BET_WIN_MONEY = 'game_bet_win_money';
    case GAME_REFUNDED_MONEY = 'game_refunded_money';
    case GAME_CANCELED_MONEY = 'game_canceled_money';
    case GAME_JACKPOT_MONEY = 'game_jackpot_money';
    case GAME_BONUS_MONEY = 'game_bonus_money';
    case GAME_PROMO_WIN_MONEY = 'game_promo_win_money';
    case ROLLING_MONEY_DISTRIBUTED = 'rolling_money_distributed';
    case ROLLING_MONEY_WITHDRAWAL = 'rolling_money_withdrawal';
    case LOSING_MONEY_DISTRIBUTED = 'losing_money_distributed';
    case LOSING_MONEY_DEBITED = 'losing_money_debited';
    case LOSING_MONEY_WITHDRAWAL = 'losing_money_withdrawal';
    case WEEKLY_LOSS_BONUS = 'weekly_loss_bonus';
    case MONEY_DEPOSITED = 'money_deposited';
    case MONEY_WITHDRAWAL = 'money_withdrawal';
    case REFFERAL_BONUS_POINTS = 'referral_bonus_points';
    case PROMOTION_POINTS = 'promotion_points';
}
