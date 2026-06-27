<?php

namespace App\Enums\Stats;

use App\Enums\BaseEnumTrait;
use App\Enums\User\PlayingRoleEnum;

enum StatCategoryEnum: string
{
    use BaseEnumTrait;

    case BATTING = 'batting';
    case BOWLING = 'bowling';
    case FIELDING = 'fielding';

    public function label(): string
    {
        return match ($this) {
            self::BATTING => 'Batting',
            self::BOWLING => 'Bowling',
            self::FIELDING => 'Fielding',
        };
    }

    /** Default sort column for leaderboard queries on this category. */
    public function defaultSort(): string
    {
        return match ($this) {
            self::BATTING => 'runs',
            self::BOWLING => 'wickets',
            self::FIELDING => 'ct',
        };
    }

    /** Default leaderboard category when the client omits `category` on ranking-position. */
    public static function defaultForPlayingRole(?PlayingRoleEnum $role): self
    {
        return match ($role) {
            PlayingRoleEnum::BOWLER => self::BOWLING,
            PlayingRoleEnum::ALL_ROUNDER,
            PlayingRoleEnum::BATSMAN => self::BATTING,
            default => self::BATTING,
        };
    }
}
