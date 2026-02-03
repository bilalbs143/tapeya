<?php

namespace App\Promotions\Dto;

class EligibilityResult
{
    public function __construct(
        public readonly bool $eligible,
        public readonly ?string $reason = null,
        public readonly array $meta = []
    ) {}
}

