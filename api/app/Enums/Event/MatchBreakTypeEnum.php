<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Break types recorded during a match (Action menu → Add Breaks).
 */
enum MatchBreakTypeEnum: string
{
    use BaseEnumTrait;

    case SHORT_DRINKS = 'short_drinks';
    case LUNCH = 'lunch';
    case DINNER = 'dinner';
    case STRATEGIC_TIMEOUT = 'strategic_timeout';
    case RAIN_STOP = 'rain_stop';
    case PITCH_CONDITIONS = 'pitch_conditions';
    case BAD_LIGHT = 'bad_light';
    case EMERGENCY = 'emergency';
    case BAD_WEATHER = 'bad_weather';
    case TEAMS_NOT_PRESENT = 'teams_not_present';
    case TEA = 'tea';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::SHORT_DRINKS => 'Short Drinks Break',
            self::LUNCH => 'Lunch Break',
            self::DINNER => 'Dinner Break',
            self::STRATEGIC_TIMEOUT => 'Strategic Timeout',
            self::RAIN_STOP => 'Rain Stopped Play',
            self::PITCH_CONDITIONS => 'Pitch Conditions Inspection',
            self::BAD_LIGHT => 'Bad Light',
            self::EMERGENCY => 'Emergency',
            self::BAD_WEATHER => 'Bad Weather',
            self::TEAMS_NOT_PRESENT => 'Teams Not Ready',
            self::TEA => 'Tea Break',
            self::OTHER => 'Other',
        };
    }
}
