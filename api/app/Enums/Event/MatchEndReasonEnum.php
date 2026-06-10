<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Why a match was ended or cancelled manually by the organizer.
 *
 * Note: LOW_LIGHT value kept as 'low_light' (matches DB). The equivalent break
 * type in MatchBreakTypeEnum uses BAD_LIGHT — labels are now aligned to 'Bad Light'.
 */
enum MatchEndReasonEnum: string
{
    use BaseEnumTrait;

    case HEAVY_RAIN = 'heavy_rain';
    case UNPLAYABLE_PITCH = 'unplayable_pitch';
    case LOW_LIGHT = 'low_light';           // same concept as MatchBreakTypeEnum::BAD_LIGHT
    case CROWD_DISTURBANCE = 'crowd_disturbance';
    case ATMOSPHERE = 'atmosphere';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::HEAVY_RAIN => 'Heavy Rain',
            self::UNPLAYABLE_PITCH => 'Unplayable Pitch',
            self::LOW_LIGHT => 'Bad Light',              // aligned with MatchBreakTypeEnum::BAD_LIGHT label
            self::CROWD_DISTURBANCE => 'Disturbance In Crowd',
            self::ATMOSPHERE => 'Atmospheric Conditions',
            self::OTHER => 'Other',
        };
    }
}
