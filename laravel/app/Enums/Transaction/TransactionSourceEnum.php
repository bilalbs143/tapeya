<?php

namespace App\Enums\Transaction;

use App\Enums\BaseEnumTrait;

enum TransactionSourceEnum: string
{
    use BaseEnumTrait;

    case GAME = 'game';
    case EXCHANGE_REQUEST = 'exchange_request';
    case MANUAL_PAYMENT = 'manual_payment';
    case MANUAL_RECOVERY = 'manual_recovery';
    case MANUAL_POINTS_PAYMENT = 'manual_points_payment';
    case MANUAL_POINTS_RECOVERY = 'manual_points_recovery';
    case MANUAL_COUPON_POINTS_PAYMENT = 'manual_coupon_points_payment';
    case MANUAL_COUPON_POINTS_RECOVERY = 'manual_coupon_points_recovery';
    case DEPOSIT_BONUS = 'deposit_bonus';
    case REFFERAL_BONUS = 'referral_bonus';
    case BET = 'bet';
    case CRYPTO = 'crypto';
    case PROMOTION = 'promotion';
}
