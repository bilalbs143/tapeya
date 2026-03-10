<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Ball extra types (wide, no ball, bye, leg bye) for scoring.
 * Value matches frontend ball type and API flags (is_wide, is_no_ball, etc.).
 */
enum ExtraTypeEnum: string
{
    use BaseEnumTrait;

    case WIDE = 'wd';
    case NO_BALL = 'nb';
    case BYE = 'bye';
    case LEG_BYE = 'lb';

    public function label(): string
    {
        return match ($this) {
            self::WIDE => 'Wide',
            self::NO_BALL => 'No ball',
            self::BYE => 'Bye',
            self::LEG_BYE => 'Leg bye',
        };
    }

    /** Short label for scoring buttons (e.g. WD, NB). */
    public function shortLabel(): string
    {
        return match ($this) {
            self::WIDE => 'WD',
            self::NO_BALL => 'NB',
            self::BYE => 'BYE',
            self::LEG_BYE => 'LB',
        };
    }
}
