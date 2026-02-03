<?php

namespace App\Promotions\Dto;

use App\Enums\Promotion\PromotionPayoutTypeEnum;

class PayoutResult
{
    public function __construct(
        public readonly PromotionPayoutTypeEnum $type,
        public readonly float $amount,
        public readonly ?string $currency = null,
        public readonly array $meta = [],
    ) {}
}

