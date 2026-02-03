<?php

namespace App\Promotions\Dto;

class BetEvent
{
    public function __construct(
        public readonly int $userId,
        public readonly string $product, // e.g., slots, sportsbook, baccarat, poker, arcade, sabung, casino
        public readonly float $stake,
        public readonly float $payout,
        public readonly ?float $odds = null,
        public readonly ?string $ticketId = null,
        public readonly ?string $result = null, // win, lose, tie, side, unknown
        public readonly array $meta = [],
    ) {}

    public function netWinLoss(): float
    {
        return $this->payout - $this->stake;
    }
}

