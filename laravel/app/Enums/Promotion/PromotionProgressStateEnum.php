<?php

namespace App\Enums\Promotion;

use App\Enums\BaseEnumTrait;

enum PromotionProgressStateEnum: string
{
    use BaseEnumTrait;

    case ELIGIBLE = 'eligible';
    case ACTIVATED = 'activated';
    case COMPLETED = 'completed';
    case FORFEITED = 'forfeited';
    case EXPIRED = 'expired';
}

