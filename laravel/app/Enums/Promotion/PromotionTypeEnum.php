<?php

namespace App\Enums\Promotion;

use App\Enums\BaseEnumTrait;

enum PromotionTypeEnum: string
{
    use BaseEnumTrait;

    case SLOTS_DEPOSIT = 'slots_deposit';
    case CASINO_STREAK = 'casino_streak';
    case SLOTS_CASHBACK_COMMISSION = 'slots_cashback_commission';
    case SPORTS_CASHBACK_COMMISSION = 'sports_cashback_commission';
    case POKER_RAKEBACK = 'poker_rakeback';
    case ARCADE_CASHBACK = 'arcade_cashback';
    case CASINO_COMMISSION = 'casino_commission';
    case LOSS_GUARANTEE = 'loss_guarantee';
    case SABUNG_CASHBACK = 'sabung_cashback';
}
