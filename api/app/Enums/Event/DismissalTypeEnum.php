<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * How the batter was out (when is_wicket = true).
 * Aligned with tournament_flow § Per-ball data.
 */
enum DismissalTypeEnum: string
{
    use BaseEnumTrait;

    case BOWLED = 'bowled';
    case CAUGHT = 'caught';
    case STUMPED = 'stumped';
    case LBW = 'lbw';
    case RUN_OUT = 'run_out';
    case OVER_THE_FENCE = 'over_the_fence';
    case MANKAD = 'mankad';
    case RETIRED = 'retired';
    case HIT_WICKET = 'hit_wicket';
    case HIT_BALL_TWICE = 'hit_ball_twice';
    case TIMED_OUT = 'timed_out';
    case ONE_HAND_ONE_BOUNCE = 'one_hand_one_bounce';
    case OBSTRUCTING_THE_FIELD = 'obstructing_the_field';

    public function label(): string
    {
        return match ($this) {
            self::BOWLED => 'Bowled',
            self::CAUGHT => 'Caught',
            self::STUMPED => 'Stumped',
            self::LBW => 'LBW',
            self::RUN_OUT => 'Run Out',
            self::OVER_THE_FENCE => 'Over the Fence',
            self::MANKAD => 'Mankad',
            self::RETIRED => 'Retired',
            self::HIT_WICKET => 'Hit Wicket',
            self::HIT_BALL_TWICE => 'Hit Ball Twice',
            self::TIMED_OUT => 'Timed Out',
            self::ONE_HAND_ONE_BOUNCE => 'One Hand One Bounce',
            self::OBSTRUCTING_THE_FIELD => 'Obstructing the Field',
        };
    }

    /** Whether this dismissal type requires fielder_id (for API validation and UI fielder picker). */
    public function requiresFielder(): bool
    {
        return match ($this) {
            self::CAUGHT, self::STUMPED, self::RUN_OUT => true,
            default => false,
        };
    }
}
