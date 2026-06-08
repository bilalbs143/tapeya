<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Why an innings was ended (manual end from scorer or inferred on completion).
 */
enum InningsEndReasonEnum: string
{
    use BaseEnumTrait;

    case ALL_OUT = 'all_out';
    case OVERS_BOWLED = 'overs_bowled';
    case RUNS_CHASED = 'runs_chased';
    case OUT_OF_TIME = 'out_of_time';
    case CAPTAIN = 'captain';
    case REFEREE = 'referee';
    case RAIN = 'rain';
    case TARGET_REVISION = 'target_revision';

    public function label(): string
    {
        return match ($this) {
            self::ALL_OUT => 'All Out',
            self::OVERS_BOWLED => 'Overs Bowled',
            self::RUNS_CHASED => 'Runs Chased',
            self::OUT_OF_TIME => 'Out of Time',
            self::CAPTAIN => 'Captain End Innings',
            self::REFEREE => 'Referee End Innings',
            self::RAIN => 'Ended Due to Rain',
            self::TARGET_REVISION => 'Target Revised (DLS)',
        };
    }

    public function endedBy(): ?InningsEndedByEnum
    {
        return match ($this) {
            self::CAPTAIN => InningsEndedByEnum::CAPTAIN,
            self::REFEREE => InningsEndedByEnum::REFEREE,
            default => null,
        };
    }

    /**
     * Reason string sent in match_state.active_innings.innings_complete_reason.
     * The frontend InningsEndDialog maps these to display text.
     *
     * Mapped values the frontend handles:
     *   'all_out'         — all wickets fallen
     *   'target_reached'  — second innings: target score met (includes DLS target revision)
     *   'overs_complete'  — all overs bowled
     *   'manual'          — organizer / admin action (captain, referee, rain, time)
     */
    public function matchStateReason(): string
    {
        return match ($this) {
            self::ALL_OUT => 'all_out',
            self::OVERS_BOWLED => 'overs_complete',
            self::RUNS_CHASED => 'target_reached',
            self::TARGET_REVISION => 'target_reached', // DLS — innings ends because revised target was met/set
            self::OUT_OF_TIME => 'manual',
            self::CAPTAIN => 'manual',
            self::REFEREE => 'manual',
            self::RAIN => 'manual',
        };
    }
}
