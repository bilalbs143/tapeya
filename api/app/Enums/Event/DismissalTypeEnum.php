<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * How the batter was dismissed (when is_wicket = true) or retired.
 *
 * Valid on a FREE HIT ball: run_out, obstructing_the_field, hit_ball_twice only.
 * All other dismissal types are illegal on a free-hit delivery (Law 21.18).
 *
 * retired_hurt is stored with is_wicket = true (so the ball row records the event)
 * but does NOT count as a wicket and the batter may return to the crease later.
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
    case MANKAD = 'mankad';
    case RETIRED = 'retired';                       // retired out — counts as a wicket; NOT credited to bowler
    case RETIRED_HURT = 'retired_hurt';             // retired hurt — NOT a wicket; batter may return
    case HIT_WICKET = 'hit_wicket';
    case HIT_BALL_TWICE = 'hit_ball_twice';
    case TIMED_OUT = 'timed_out';
    case OBSTRUCTING_THE_FIELD = 'obstructing_the_field';

    public function label(): string
    {
        return match ($this) {
            self::BOWLED => 'Bowled',
            self::CAUGHT => 'Caught',
            self::STUMPED => 'Stumped',
            self::LBW => 'LBW',
            self::RUN_OUT => 'Run Out',
            self::MANKAD => 'Mankad',
            self::RETIRED => 'Retired Out',
            self::RETIRED_HURT => 'Retired Hurt',
            self::HIT_WICKET => 'Hit Wicket',
            self::HIT_BALL_TWICE => 'Hit Ball Twice',
            self::TIMED_OUT => 'Timed Out',
            self::OBSTRUCTING_THE_FIELD => 'Obstructing the Field',
        };
    }

    /**
     * Whether this dismissal type requires a fielder_id to be recorded.
     * Mankad is a non-striker run-out where the bowler acts as the fielder.
     */
    public function requiresFielder(): bool
    {
        return match ($this) {
            self::CAUGHT, self::STUMPED, self::RUN_OUT, self::MANKAD => true,
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
     * Whether this dismissal is credited to the bowler's wicket column.
     *
     * Fielding dismissals (run out, obstructing, hit ball twice)
     * and administrative dismissals (timed out, retired out) are NOT
     * credited to the bowler per MCC Laws.
     */
    public function countsAsBowlerWicket(): bool
    {
        return match ($this) {
            self::RUN_OUT,
            self::OBSTRUCTING_THE_FIELD,
            self::HIT_BALL_TWICE,
            self::MANKAD,
            self::RETIRED,       // retired-out is not a bowler wicket
            self::TIMED_OUT => false,
            default => true,
        };
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

    /**
     * Valid dismissals when the wicket occurs on a wide delivery.
     * Law 37: Obstructing the field is valid on any delivery, including a wide.
     */
    public function validOnWideDelivery(): bool
    {
        return match ($this) {
            self::RUN_OUT, self::STUMPED, self::OBSTRUCTING_THE_FIELD => true,
            default => false,
        };
    }

    /**
     * Valid dismissals when the wicket occurs on a no-ball delivery (not a free-hit).
     */
    public function validOnNoBallDelivery(): bool
    {
        return match ($this) {
            self::RUN_OUT, self::OBSTRUCTING_THE_FIELD, self::HIT_BALL_TWICE => true,
            default => false,
        };
    }
}
