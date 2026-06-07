<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum NoBallRunsTypeEnum: string
{
    use BaseEnumTrait;

    case FROM_BAT = 'from_bat';
    case BYE = 'bye';
    case LEG_BYE = 'leg_bye';

    public function label(): string
    {
        return match ($this) {
            self::FROM_BAT => 'From Bat',
            self::BYE => 'Bye',
            self::LEG_BYE => 'Leg Bye',
        };
    }
}
