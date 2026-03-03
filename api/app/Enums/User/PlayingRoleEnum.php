<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum PlayingRoleEnum: string
{
    use BaseEnumTrait;

    case BOWLER = 'bowler';
    case BATSMAN = 'batsman';
    case ALL_ROUNDER = 'all_rounder';

    public function label(): string
    {
        return match ($this) {
            self::BOWLER => 'Bowler',
            self::BATSMAN => 'Batsman',
            self::ALL_ROUNDER => 'All Rounder',
        };
    }
}
