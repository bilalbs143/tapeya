<?php

namespace Tests\Support\Scoring;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\PenaltyTeamEnum;
use App\Models\Ball;
use Illuminate\Support\Collection;

/**
 * Builds in-memory {@see Ball} models for unit tests — no database required.
 */
final class BallFactory
{
    private static int $autoId = 1;

    public static function resetIds(): void
    {
        self::$autoId = 1;
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public static function make(array $attrs = []): Ball
    {
        $defaults = [
            'id' => self::$autoId++,
            'over' => 0,
            'ball_in_over' => 1,
            'striker_id' => PlayerIds::STRIKER,
            'non_striker_id' => PlayerIds::NON_STRIKER,
            'bowler_id' => PlayerIds::BOWLER,
            'runs' => 0,
            'runs_off_bat' => 0,
            'is_no_ball' => false,
            'is_wide' => false,
            'is_bye' => false,
            'is_leg_bye' => false,
            'is_wicket' => false,
            'is_free_hit' => false,
            'dont_count_ball' => false,
            'penalty_runs' => 0,
            'additional_runs' => 0,
        ];

        return new Ball(array_merge($defaults, $attrs));
    }

    public static function dot(?int $striker = null, ?int $nonStriker = null): Ball
    {
        return self::legal(0, $striker, $nonStriker);
    }

    public static function legal(int $runsOffBat, ?int $striker = null, ?int $nonStriker = null, ?int $over = null, ?int $ballInOver = null): Ball
    {
        return self::make(array_filter([
            'runs' => $runsOffBat,
            'runs_off_bat' => $runsOffBat,
            'striker_id' => $striker ?? PlayerIds::STRIKER,
            'non_striker_id' => $nonStriker ?? PlayerIds::NON_STRIKER,
            'over' => $over,
            'ball_in_over' => $ballInOver,
        ], fn ($v) => $v !== null));
    }

    public static function wide(int $totalRuns = 1, ?int $striker = null): Ball
    {
        return self::make([
            'is_wide' => true,
            'runs' => $totalRuns,
            'runs_off_bat' => 0,
            'striker_id' => $striker ?? PlayerIds::STRIKER,
        ]);
    }

    public static function noBall(int $runsOffBat = 0, ?int $striker = null): Ball
    {
        $total = $runsOffBat > 0 ? $runsOffBat + 1 : 1;

        return self::make([
            'is_no_ball' => true,
            'runs' => $total,
            'runs_off_bat' => $runsOffBat,
            'striker_id' => $striker ?? PlayerIds::STRIKER,
        ]);
    }

    public static function noBallBye(int $byeRuns): Ball
    {
        return self::make([
            'is_no_ball' => true,
            'is_bye' => true,
            'runs' => 1 + $byeRuns,
            'runs_off_bat' => 0,
        ]);
    }

    public static function noBallLegBye(int $lbRuns): Ball
    {
        return self::make([
            'is_no_ball' => true,
            'is_leg_bye' => true,
            'runs' => 1 + $lbRuns,
            'runs_off_bat' => 0,
        ]);
    }

    public static function bye(int $runs): Ball
    {
        return self::make([
            'is_bye' => true,
            'runs' => $runs,
            'runs_off_bat' => 0,
        ]);
    }

    public static function legBye(int $runs): Ball
    {
        return self::make([
            'is_leg_bye' => true,
            'runs' => $runs,
            'runs_off_bat' => 0,
        ]);
    }

    public static function penalty(int $runs, string $team = 'batting'): Ball
    {
        return self::make([
            'penalty_runs' => $runs,
            'penalty_team' => $team === 'bowling'
                ? PenaltyTeamEnum::BOWLING->value
                : PenaltyTeamEnum::BATTING->value,
        ]);
    }

    public static function additionalRuns(int $runs): Ball
    {
        return self::make([
            'additional_runs' => $runs,
        ]);
    }

    /**
     * @param  array<string, mixed>  $extra
     */
    public static function wicket(
        DismissalTypeEnum $type,
        ?int $outPlayerId = null,
        ?int $incomingStrikerId = null,
        ?int $incomingNonStrikerId = null,
        array $extra = [],
    ): Ball {
        $out = $outPlayerId ?? PlayerIds::STRIKER;

        return self::make(array_merge([
            'is_wicket' => true,
            'dismissal_type' => $type,
            'out_player_id' => $out,
            'striker_id' => $incomingStrikerId ?? PlayerIds::STRIKER,
            'non_striker_id' => $incomingNonStrikerId ?? PlayerIds::NON_STRIKER,
        ], $extra));
    }

    public static function runOut(
        ?int $outPlayerId = null,
        ?bool $crossed = null,
        int $runsBeforeDismissal = 0,
        bool $onWide = false,
        bool $onNoBall = false,
        ?int $nextStrikerId = null,
        ?int $nextNonStrikerId = null,
    ): Ball {
        $extra = [
            'is_wicket' => true,
            'dismissal_type' => DismissalTypeEnum::RUN_OUT,
            'out_player_id' => $outPlayerId ?? PlayerIds::STRIKER,
            'fielder_id' => PlayerIds::FIELDER,
        ];

        if ($crossed !== null) {
            $extra['batter_crossed'] = $crossed;
        }

        if ($onWide) {
            $extra['is_wide'] = true;
            $extra['runs'] = 1 + $runsBeforeDismissal;
            $extra['runs_off_bat'] = 0;
        } elseif ($onNoBall) {
            $extra['is_no_ball'] = true;
            $extra['runs'] = 1 + $runsBeforeDismissal;
            $extra['runs_off_bat'] = $runsBeforeDismissal;
        } else {
            $extra['runs'] = $runsBeforeDismissal;
            $extra['runs_off_bat'] = $runsBeforeDismissal;
        }

        if ($nextStrikerId !== null) {
            $extra['striker_id'] = $nextStrikerId;
        }
        if ($nextNonStrikerId !== null) {
            $extra['non_striker_id'] = $nextNonStrikerId;
        }

        return self::make($extra);
    }

    /**
     * @param  list<Ball>  $balls
     * @return Collection<int, Ball>
     */
    public static function collection(array $balls): Collection
    {
        return collect($balls)->values();
    }

    /**
     * Assign sequential over/ball_in_over for a flat delivery list using legal-ball rules.
     *
     * @param  list<Ball>  $balls
     * @return list<Ball>
     */
    public static function withPositions(array $balls): array
    {
        $legalInOver = 0;
        $over = 0;
        $ballInOver = 1;
        $result = [];

        foreach ($balls as $ball) {
            $ball = clone $ball;
            $ball->over = $over;
            $ball->ball_in_over = $ballInOver;
            $result[] = $ball;

            $ballInOver++;

            if ($ball->isLegalDelivery()) {
                $legalInOver++;
                if ($legalInOver === 6) {
                    $legalInOver = 0;
                    $over++;
                    $ballInOver = 1;
                }
            }
        }

        return $result;
    }
}
