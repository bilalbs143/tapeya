<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum TournamentInterestCampaignStatusEnum: string
{
    use BaseEnumTrait;

    case OPEN = 'open';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Open',
            self::CLOSED => 'Closed',
        };
    }
}
