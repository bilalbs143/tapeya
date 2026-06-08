<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum PenaltyReasonEnum: string
{
    use BaseEnumTrait;

    case DELIBERATE_SHORT_RUN = 'deliberate_short_run';
    case TIME_WASTING_BATTING = 'time_wasting_batting';
    case DAMAGING_PITCH_BATTING = 'damaging_pitch_batting';
    case PRACTICE_ON_FIELD_BATTING = 'practice_on_field_batting';
    case UNFAIR_STEALING_RUN = 'unfair_stealing_run';
    case TIME_WASTING_BOWLING = 'time_wasting_bowling';
    case DAMAGING_PITCH_BOWLING = 'damaging_pitch_bowling';
    case BALL_TAMPERING = 'ball_tampering';
    case DELIBERATE_DISTRACTION = 'deliberate_distraction';
    case FIELDING_RESTRICTION_BREACH = 'fielding_restriction_breach';
    case SUPER_BALL = 'super_ball';
    case UNFAIR_ACTIONS = 'unfair_actions';

    public function label(): string
    {
        return match ($this) {
            self::DELIBERATE_SHORT_RUN => 'Deliberate Short Run',
            self::TIME_WASTING_BATTING => 'Time Wasting by Batting Side',
            self::DAMAGING_PITCH_BATTING => 'Damaging the Pitch by Batting Side',
            self::PRACTICE_ON_FIELD_BATTING => 'Practice on the Field by Batting Side',
            self::UNFAIR_STEALING_RUN => 'Batter Unfairly Stealing a Run',
            self::TIME_WASTING_BOWLING => 'Time Wasting by Bowling Side',
            self::DAMAGING_PITCH_BOWLING => 'Damaging the Pitch by Bowling Side',
            self::BALL_TAMPERING => 'Ball Tampering',
            self::DELIBERATE_DISTRACTION => 'Deliberate Distraction of Batter',
            self::FIELDING_RESTRICTION_BREACH => 'Fielding Restriction Breach',
            self::SUPER_BALL => 'Super Ball',
            self::UNFAIR_ACTIONS => 'Unfair Actions',
        };
    }
}
