<?php

namespace App\Enums\Promotion;

use App\Enums\BaseEnumTrait;

enum PromotionPayoutTypeEnum: string
{
    use BaseEnumTrait;

    case BONUS = 'bonus';
    case CASHBACK = 'cashback';
    case COMMISSION = 'commission';
    case RAKEBACK = 'rakeback';
    case LOSS_GUARANTEE = 'loss_guarantee';
}

