<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum MatchTimingEnum: string
{
    use BaseEnumTrait;

    case DAY = 'day';
    case NIGHT = 'night';
    case DAY_AND_NIGHT = 'day_and_night';

    public function label(): string
    {
        return match ($this) {
            self::DAY => 'Day',
            self::NIGHT => 'Night',
            self::DAY_AND_NIGHT => 'Day & Night',
        };
    }
}
