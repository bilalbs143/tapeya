<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum PenaltyTeamEnum: string
{
    use BaseEnumTrait;

    case BATTING = 'batting';
    case BOWLING = 'bowling';

    public function label(): string
    {
        return match ($this) {
            self::BATTING => 'Batting',
            self::BOWLING => 'Bowling',
        };
    }
}
