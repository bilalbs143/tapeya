<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * How the batter was dismissed (when is_wicket = true) or retired.
 *
 * Valid on a FREE HIT ball: run_out, obstructing_the_field, hit_ball_twice only.
 * All other dismissal types are illegal on a free-hit delivery.
 *
 * retired_hurt is stored with is_wicket = false — it does NOT count as a wicket
 * and the batter may return to the crease later in the innings.
 *
 * retired (retired_out) is stored with is_wicket = true — counts as a wicket.
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
    case RETIRED = 'retired';         // retired out — counts as a wicket
    case RETIRED_HURT = 'retired_hurt';    // retired hurt — NOT a wicket
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
            self::RETIRED => 'Retired Out',
            self::RETIRED_HURT => 'Retired Hurt',
            self::HIT_WICKET => 'Hit Wicket',
            self::HIT_BALL_TWICE => 'Hit Ball Twice',
            self::TIMED_OUT => 'Timed Out',
            self::ONE_HAND_ONE_BOUNCE => 'One Hand One Bounce',
            self::OBSTRUCTING_THE_FIELD => 'Obstructing the Field',
        };
    }

    /**
     * Whether this dismissal type requires a fielder_id.
     */
    public function requiresFielder(): bool
    {
        return match ($this) {
            self::CAUGHT, self::STUMPED, self::RUN_OUT => true,
            default => false,
        };
    }

    /**
     * Whether this dismissal counts as a wicket in the scorecard.
     * Retired Hurt does NOT count — the batter may return to the crease.
     */
    public function countsAsWicket(): bool
    {
        return $this !== self::RETIRED_HURT;
    }

    /**
     * Whether this dismissal type is valid on a free-hit delivery.
     * Law 21.18: Only run out, obstructing the field, and hitting the ball twice are permitted.
     */
    public function validOnFreeHit(): bool
    {
        return match ($this) {
            self::RUN_OUT, self::OBSTRUCTING_THE_FIELD, self::HIT_BALL_TWICE => true,
            default => false,
        };
    }
}
