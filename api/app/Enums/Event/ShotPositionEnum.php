<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Side of ground / fielding position where the shot went (for ball-by-ball scorecard).
 */
enum ShotPositionEnum: string
{
    use BaseEnumTrait;

    case DEEP_FINE_LEG = 'deep_fine_leg';
    case THIRD_MAN = 'third_man';
    case DEEP_POINT = 'deep_point';
    case DEEP_COVER = 'deep_cover';
    case LONG_OFF = 'long_off';
    case LONG_ON = 'long_on';
    case MID_WICKET = 'mid_wicket';
    case SQUARE_LEG = 'square_leg';

    public function label(): string
    {
        return match ($this) {
            self::DEEP_FINE_LEG => 'Deep Fine Leg',
            self::THIRD_MAN => 'Third Man',
            self::DEEP_POINT => 'Deep Point',
            self::DEEP_COVER => 'Deep Cover',
            self::LONG_OFF => 'Long Off',
            self::LONG_ON => 'Long On',
            self::MID_WICKET => 'Mid Wicket',
            self::SQUARE_LEG => 'Square Leg',
        };
    }
}
