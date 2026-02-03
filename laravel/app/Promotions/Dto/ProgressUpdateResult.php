<?php

namespace App\Promotions\Dto;

use App\Enums\Promotion\PromotionProgressStateEnum;

class ProgressUpdateResult
{
    public function __construct(
        public readonly PromotionProgressStateEnum $state,
        public readonly float $turnover,
        public readonly float $netWinLoss,
        public readonly array $meta = [],
    ) {}
}

