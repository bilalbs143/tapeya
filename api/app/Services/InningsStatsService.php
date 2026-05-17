<?php

namespace App\Services;

use App\Models\Ball;
use App\Models\User;
use App\Services\Broadcast\GraphicContextBuilder;
use App\Services\Broadcast\GraphicContextOrchestrator;
use Illuminate\Support\Collection;

/**
 * Centralized innings stats computation — single source of truth used by
 * ScorecardController (scorecard API) and the graphics overlay pipeline
 * ({@see GraphicContextOrchestrator} →
 * {@see GraphicContextBuilder}). Both consumers
 * call compute() and use the parts they need; graphic-specific output (over
 * tracking, required RR, target) is still built by GraphicContextBuilder.
 */
class InningsStatsService
{
    /**
     * Walk ball-by-ball and return who is on strike / non-strike for the *next*
     * delivery — i.e. after applying the same strike-rotation rules as the
     * scoring app (odd runs off bat, odd legal byes/leg-byes, dismissals, and
     * change of ends when six legal deliveries complete without an odd-run flip
     * on that delivery).
     *
     * Each ball row stores striker/non-striker at the *start* of that delivery,
     * so {@see compute()} must not use the last row's striker_id alone as
     * "current" striker after an odd run.
     *
     * @param  Collection<int, Ball>  $balls  Sorted: over → ball_in_over → id
     * @return array{striker_id: int|null, non_striker_id: int|null}
     */
    public static function resolveCreaseAfterBalls(Collection $balls): array
    {
        if ($balls->isEmpty()) {
            return ['striker_id' => null, 'non_striker_id' => null];
        }

        /** @var list<Ball> $arr */
        $arr = $balls->values()->all();
        $first = $arr[0];
        $sid = $first->striker_id ? (int) $first->striker_id : null;
        $nid = $first->non_striker_id ? (int) $first->non_striker_id : null;

        $legalInOver = 0;

        $n = count($arr);
        for ($i = 0; $i < $n; $i++) {
            $ball = $arr[$i];
            $nextBall = $arr[$i + 1] ?? null;

            if ($ball->striker_id) {
                $sid = (int) $ball->striker_id;
            }
            if ($ball->non_striker_id) {
                $nid = (int) $ball->non_striker_id;
            }

            if ($ball->is_wicket) {
                [$sid, $nid] = self::creaseAfterDismissalBall($ball, $nextBall, $sid, $nid);
                if ($ball->isLegalDelivery()) {
                    $legalInOver++;
                    if ($legalInOver === 6) {
                        $legalInOver = 0;
                    }
                }

                continue;
            }

            $isLegal = $ball->isLegalDelivery();
            $oddRot = false;

            // Legal runs off the bat (not wide / NB / bye / LB)
            if (! $ball->is_wide && ! $ball->is_no_ball && ! $ball->is_bye && ! $ball->is_leg_bye) {
                $rob = self::strikerRunsOffBat($ball);
                if ($rob % 2 === 1 && $sid && $nid) {
                    [$sid, $nid] = [$nid, $sid];
                    $oddRot = true;
                }
            } elseif (($ball->is_bye || $ball->is_leg_bye) && $isLegal) {
                $runs = (int) ($ball->runs ?? 0);
                if ($runs % 2 === 1 && $sid && $nid) {
                    [$sid, $nid] = [$nid, $sid];
                    $oddRot = true;
                }
            }

            if ($isLegal) {
                $legalInOver++;
                if ($legalInOver === 6) {
                    if (! $oddRot && $sid && $nid) {
                        [$sid, $nid] = [$nid, $sid];
                    }
                    $legalInOver = 0;
                }
            }
        }

        return ['striker_id' => $sid, 'non_striker_id' => $nid];
    }

    /**
     * @return array{0: int|null, 1: int|null}
     */
    private static function creaseAfterDismissalBall(Ball $ball, ?Ball $nextBall, ?int $sid, ?int $nid): array
    {
        $outId = (int) ($ball->out_player_id ?? $ball->striker_id ?? 0);
        if ($outId === 0) {
            return [$sid, $nid];
        }

        $deliveryStriker = $ball->striker_id ? (int) $ball->striker_id : ($sid ?? 0);
        $staysId = ((int) $outId === (int) $sid) ? $nid : $sid;
        $nextId = self::incomingBatsmanIdFromNextBall($nextBall, $staysId);

        $outWasStriker = ((int) $outId === (int) $deliveryStriker);
        $newSid = $outWasStriker ? $nextId : $staysId;
        $newNid = $outWasStriker ? $staysId : $nextId;

        return [$newSid ?: null, $newNid ?: null];
    }

    /**
     * Whether the *next* delivery after $ball should be a free-hit.
     *
     * Law 21.18: A free-hit carries over when the previous delivery was a no-ball,
     * OR when the previous delivery was itself a free-hit bowled as a wide
     * (a free-hit wide is still a no-ball equivalent — the free-hit repeats).
     */
    public static function isFreeHitDelivery(?Ball $ball): bool
    {
        if ($ball === null) {
            return false;
        }

        return (bool) $ball->is_no_ball
            || ((bool) $ball->is_free_hit && (bool) $ball->is_wide);
    }

    private static function incomingBatsmanIdFromNextBall(?Ball $nextBall, ?int $staysId): ?int
    {
        if ($nextBall === null || $staysId === null) {
            return null;
        }

        foreach ([$nextBall->striker_id, $nextBall->non_striker_id] as $pid) {
            if ($pid && (int) $pid !== (int) $staysId) {
                return (int) $pid;
            }
        }

        return null;
    }

    /**
     * Runs credited to the striker off the bat for this ball (used for batting_by_id).
     * When {@see Ball::$runs_off_bat} is stored as 0 but {@see Ball::$runs} holds the real
     * off-the-bat value (legacy / partial rows), fall back to {@see Ball::$runs}.
     */
    public static function strikerRunsOffBat(Ball $ball): int
    {
        if ($ball->is_wide) {
            return 0;
        }
        if ($ball->is_bye || $ball->is_leg_bye) {
            return 0;
        }
        if ($ball->is_no_ball) {
            $total = (int) ($ball->runs ?? 0);
            $snip = (int) ($ball->runs_off_bat ?? 0);
            if ($snip > 0) {
                return $snip;
            }
            if ($total > 0) {
                return max(0, $total - 1);
            }

            return 0;
        }
        $rob = (int) ($ball->runs_off_bat ?? 0);
        $r = (int) ($ball->runs ?? 0);

        return $rob > 0 ? $rob : $r;
    }

    /**
     * Compute all per-innings stats from a sorted ball collection in one pass.
     *
     * @param  Collection<int, Ball>  $balls  Pre-sorted: over → ball_in_over → id.
     * @param  array<int, string>  $names  Player id → display name.
     * @return array{
     *   total_runs:         int,
     *   total_wickets:      int,
     *   legal_balls:        int,
     *   extras_breakdown:   array,
     *   batting:            list<array>,
     *   bowling:            list<array>,
     *   fall_of_wickets:    list<array>,
     *   current_striker_id: int|null,  // faces the *next* delivery (post-rotation / dismissals)
     *   dismissed_ids:      list<int>,
     *   batting_by_id:      array<int, array>,
     *   bowling_by_id:      array<int, array>,
     * }
     */
    public function compute(Collection $balls, array $names): array
    {
        $totalRuns = 0;
        $totalWickets = 0;
        $legalBalls = 0;

        // Extras breakdown accumulators
        $wides = $noBalls = $byes = $legByes = $penaltyRuns = 0;

        // Batting tracking
        $batterOrder = [];
        $batsmenStats = [];
        $dismissedIds = [];

        // Bowling tracking
        $bowlerOrder = [];
        $bowlerStats = [];
        $overRuns = [];      // "{bowlerId}_{over}" → {legal, runs} for maiden detection

        // Fall of wickets
        $fallOfWickets = [];
        $wicketNum = 0;

        foreach ($balls as $ball) {
            $isLegal = $ball->isLegalDelivery();
            $isBye = $ball->is_bye;
            $isLb = $ball->is_leg_bye;

            // Total runs include penalty runs (awarded separately, e.g. Law 41.17).
            $ballRuns = ($ball->runs ?? 0) + ($ball->penalty_runs ?? 0);

            // ── Totals ────────────────────────────────────────────────────────
            $totalRuns += $ballRuns;
            if ($isLegal) {
                $legalBalls++;
            }

            // ── Extras breakdown ──────────────────────────────────────────────
            if ($ball->is_wide) {
                // All runs on a wide (penalty + overthrows) go to extras — batter cannot score.
                $wides += (int) ($ball->runs ?? 0);
            } elseif ($ball->is_no_ball) {
                // Only the mandatory 1-run penalty + any non-batter extras go to NB extras.
                // Batter runs are credited to the batter's individual account.
                // ball.runs = runs_off_bat + extra_runs + 1  →  NB extras = runs - runs_off_bat.
                $noBalls += max(1, (int) ($ball->runs ?? 1) - (int) ($ball->runs_off_bat ?? 0));
            }
            if ($isBye) {
                $byes += (int) ($ball->runs ?? 0);
            }
            if ($isLb) {
                $legByes += (int) ($ball->runs ?? 0);
            }
            $penaltyRuns += (int) ($ball->penalty_runs ?? 0);

            // ── Batting ───────────────────────────────────────────────────────
            foreach (array_filter([$ball->striker_id, $ball->non_striker_id]) as $pid) {
                if (! isset($batsmenStats[$pid])) {
                    $batterOrder[] = $pid;
                    $batsmenStats[$pid] = [
                        'runs' => 0,
                        'balls' => 0,
                        'dots' => 0,
                        'ones' => 0,
                        'twos' => 0,
                        'threes' => 0,
                        'fours' => 0,
                        'sixes' => 0,
                        'dismissal_type' => null,
                        'dismissal_label' => null,
                        'bowler_name' => null,
                        'fielder_name' => null,
                    ];
                }
            }

            if ($ball->striker_id) {
                $rob = self::strikerRunsOffBat($ball);
                if (! $ball->is_wide) {
                    $batsmenStats[$ball->striker_id]['runs'] += $rob;
                    if ($rob === 4) {
                        $batsmenStats[$ball->striker_id]['fours']++;
                    }
                    if ($rob === 6) {
                        $batsmenStats[$ball->striker_id]['sixes']++;
                    }
                    if ($rob === 1) {
                        $batsmenStats[$ball->striker_id]['ones']++;
                    }
                    if ($rob === 2) {
                        $batsmenStats[$ball->striker_id]['twos']++;
                    }
                    if ($rob === 3) {
                        $batsmenStats[$ball->striker_id]['threes']++;
                    }
                }
                if ($isLegal) {
                    $batsmenStats[$ball->striker_id]['balls']++;
                    if ($rob === 0) {
                        $batsmenStats[$ball->striker_id]['dots']++;
                    }
                }
            }

            // ── Wicket ────────────────────────────────────────────────────────
            if ($ball->is_wicket) {
                $outId = $ball->out_player_id ?? $ball->striker_id;
                $isRetiredHurt = $ball->dismissal_type?->value === 'retired_hurt';

                if ($outId) {
                    $dismissedIds[] = $outId;
                    if (isset($batsmenStats[$outId])) {
                        $batsmenStats[$outId]['dismissal_type'] = $ball->dismissal_type?->value;
                        $batsmenStats[$outId]['dismissal_label'] = $ball->dismissal_type?->label();
                        if (! $isRetiredHurt) {
                            $batsmenStats[$outId]['bowler_name'] = $names[$ball->bowler_id] ?? null;
                            $batsmenStats[$outId]['fielder_name'] = $ball->fielder_id
                                ? ($names[$ball->fielder_id] ?? null)
                                : null;
                        }
                    }
                }

                if (! $isRetiredHurt) {
                    $totalWickets++;
                    $wicketNum++;
                    $fallOfWickets[] = [
                        'wicket_number' => $wicketNum,
                        'batsman_name' => $names[$outId] ?? '',
                        'score' => $totalRuns,
                        'overs' => self::oversDisplay($legalBalls),
                    ];
                }
            }

            // ── Bowling ───────────────────────────────────────────────────────
            if ($bid = $ball->bowler_id) {
                if (! isset($bowlerStats[$bid])) {
                    $bowlerOrder[] = $bid;
                    $bowlerStats[$bid] = ['balls' => 0, 'runs' => 0, 'wickets' => 0, 'maidens' => 0, 'dots' => 0];
                }

                // Byes and leg-byes are not charged to the bowler (ICC rules).
                $chargedToBowler = (! $isBye && ! $isLb) ? (int) ($ball->runs ?? 0) : 0;
                if (! $isBye && ! $isLb) {
                    $bowlerStats[$bid]['runs'] += (int) ($ball->runs ?? 0);
                }
                if ($isLegal) {
                    $bowlerStats[$bid]['balls']++;
                    if ($chargedToBowler === 0) {
                        $bowlerStats[$bid]['dots']++;
                    }
                }
                // Only credit the bowler when the dismissal type counts against them
                // (run_out, obstructing_the_field, hit_ball_twice, over_the_fence are fielding
                // dismissals — the bowler is NOT credited per cricket law).
                if ($ball->is_wicket && $ball->dismissal_type?->countsAsBowlerWicket()) {
                    $bowlerStats[$bid]['wickets']++;
                }

                // Per-over run/ball tracking for maiden detection.
                $overKey = $bid.'_'.$ball->over;
                if (! isset($overRuns[$overKey])) {
                    $overRuns[$overKey] = ['legal' => 0, 'runs' => 0];
                }
                if ($isLegal) {
                    $overRuns[$overKey]['legal']++;
                }
                if (! $isBye && ! $isLb) {
                    $overRuns[$overKey]['runs'] += (int) ($ball->runs ?? 0);
                }
            }
        }

        // ── Maiden detection ──────────────────────────────────────────────────
        foreach ($overRuns as $key => $ov) {
            if ($ov['legal'] === 6 && $ov['runs'] === 0) {
                $bid = (int) explode('_', $key)[0];
                if (isset($bowlerStats[$bid])) {
                    $bowlerStats[$bid]['maidens']++;
                }
            }
        }

        // ── Build formatted output lists ──────────────────────────────────────
        $battingList = array_map(fn ($id) => [
            'id' => $id,
            'name' => $names[$id] ?? '',
            'runs' => $batsmenStats[$id]['runs'] ?? 0,
            'balls' => $batsmenStats[$id]['balls'] ?? 0,
            'dots' => $batsmenStats[$id]['dots'] ?? 0,
            'ones' => $batsmenStats[$id]['ones'] ?? 0,
            'twos' => $batsmenStats[$id]['twos'] ?? 0,
            'threes' => $batsmenStats[$id]['threes'] ?? 0,
            'fours' => $batsmenStats[$id]['fours'] ?? 0,
            'sixes' => $batsmenStats[$id]['sixes'] ?? 0,
            'strike_rate' => ($batsmenStats[$id]['balls'] ?? 0) > 0
                ? round(($batsmenStats[$id]['runs'] / $batsmenStats[$id]['balls']) * 100, 1)
                : 0.0,
            'dismissal_type' => $batsmenStats[$id]['dismissal_type'],
            'dismissal_label' => $batsmenStats[$id]['dismissal_label'],
            'bowler_name' => $batsmenStats[$id]['bowler_name'],
            'fielder_name' => $batsmenStats[$id]['fielder_name'],
            'is_on_crease' => ! in_array($id, $dismissedIds, true),
            'is_retired_hurt' => ($batsmenStats[$id]['dismissal_type'] ?? null) === 'retired_hurt',
        ], $batterOrder);

        $bowlingList = array_map(function ($id) use ($bowlerStats, $names) {
            $s = $bowlerStats[$id];
            $economy = $s['balls'] > 0
                ? round($s['runs'] / ($s['balls'] / 6), 2)
                : 0.0;

            return [
                'id' => $id,
                'name' => $names[$id] ?? '',
                'overs' => self::oversDisplay($s['balls']),
                'maidens' => $s['maidens'],
                'runs' => $s['runs'],
                'wickets' => $s['wickets'],
                'dots' => $s['dots'] ?? 0,
                'economy' => number_format($economy, 2),
            ];
        }, $bowlerOrder);

        $crease = self::resolveCreaseAfterBalls($balls);
        $currentStrikerId = $crease['striker_id'];

        return [
            'total_runs' => $totalRuns,
            'total_wickets' => $totalWickets,
            'legal_balls' => $legalBalls,
            'extras_breakdown' => [
                'wides' => $wides,
                'no_balls' => $noBalls,
                'byes' => $byes,
                'leg_byes' => $legByes,
                'penalty_runs' => $penaltyRuns,
                'total' => $wides + $noBalls + $byes + $legByes + $penaltyRuns,
            ],
            'batting' => $battingList,
            'bowling' => $bowlingList,
            'fall_of_wickets' => $fallOfWickets,
            'current_striker_id' => $currentStrikerId,
            'dismissed_ids' => $dismissedIds,
            // Raw keyed maps for consumers that need O(1) lookups (e.g. graphic service).
            'batting_by_id' => $batsmenStats,
            'bowling_by_id' => $bowlerStats,
        ];
    }

    /**
     * Resolve player names from eager-loaded Ball Eloquent relations.
     * Use when balls are loaded via: ->with(['striker:id,name', 'nonStriker:id,name', ...])
     *
     * @return array<int, string>
     */
    public static function namesFromRelations(Collection $balls): array
    {
        $map = [];
        foreach ($balls as $b) {
            foreach ([
                $b->striker_id => $b->striker?->name,
                $b->non_striker_id => $b->nonStriker?->name,
                $b->bowler_id => $b->bowler?->name,
                $b->out_player_id => $b->outPlayer?->name,
                $b->fielder_id => $b->fielder?->name,
            ] as $id => $name) {
                if ($id && $name && ! isset($map[$id])) {
                    $map[$id] = $name;
                }
            }
        }

        return $map;
    }

    /**
     * Resolve player names via a single bulk DB query.
     * Use when ball relations are NOT eager-loaded (e.g. background jobs).
     *
     * @param  array<int>  $extraIds  Additional player IDs to include (e.g. pending players).
     * @return array<int, string>
     */
    public static function namesFromDatabase(Collection $balls, array $extraIds = []): array
    {
        $ids = $balls->flatMap(fn (Ball $b) => array_filter([
            $b->striker_id,
            $b->non_striker_id,
            $b->bowler_id,
            $b->out_player_id,
            $b->fielder_id,
        ]))->merge($extraIds)->filter()->unique()->values()->all();

        if (empty($ids)) {
            return [];
        }

        return User::whereIn('id', $ids)
            ->pluck('name', 'id')
            ->map(fn ($n) => $n ?? 'Player')
            ->all();
    }

    /**
     * Format a legal-ball count as "X.Y" (e.g. "3.4", "6.0").
     * Always includes the decimal part for consistency.
     */
    public static function oversDisplay(int $legalBalls): string
    {
        return intdiv($legalBalls, 6).'.'.($legalBalls % 6);
    }

    /**
     * Compute run rate as a formatted decimal string.
     */
    public static function runRate(int $runs, int $legalBalls, int $decimals = 2): string
    {
        if ($legalBalls === 0) {
            return number_format(0.0, $decimals);
        }

        return number_format($runs / ($legalBalls / 6), $decimals);
    }

    /**
     * Compute the over/ball_in_over values for the NEXT delivery in this innings.
     * Uses the existing sorted ball collection to determine current position.
     *
     * @param  Collection<int, Ball>  $balls  Pre-sorted: over → ball_in_over → id
     * @return array{over: int, ball_in_over: int}
     */
    public static function nextBallPosition(Collection $balls): array
    {
        $legalBalls = $balls->filter(fn (Ball $b) => $b->isLegalDelivery())->count();
        $overIndex = intdiv($legalBalls, 6);
        $ballsInThisOver = $balls->where('over', $overIndex)->count();

        return [
            'over' => $overIndex,
            'ball_in_over' => $ballsInThisOver + 1,
        ];
    }

    /**
     * Compute current-over display details for the MatchState response.
     *
     * Returns:
     *   over_number            — 0-indexed over currently being bowled (= next delivery's over)
     *   balls_in_current_over  — legal deliveries already bowled in this over (0-5)
     *   over_complete          — true immediately after the 6th legal ball of an over
     *   current_over_balls     — display labels for each ball in the current (in-progress) over
     *   next_is_free_hit       — true when the last ball was a no-ball (next delivery is free-hit)
     *
     * @param  Collection<int, Ball>  $balls  Pre-sorted: over → ball_in_over → id
     */
    public static function currentOverDetails(Collection $balls): array
    {
        $legalBalls = 0;
        $overComplete = false;
        $currentOverBalls = [];

        foreach ($balls as $ball) {
            $currentOverBalls[] = $ball;

            if ($ball->isLegalDelivery()) {
                $legalBalls++;
                if ($legalBalls % 6 === 0) {
                    $overComplete = true;
                    $currentOverBalls = [];
                } else {
                    $overComplete = false;
                }
            }
        }

        $overNumber = intdiv($legalBalls, 6);
        $legalInCurrentOver = $legalBalls % 6;

        $displayLabels = array_map(
            fn (Ball $b) => self::ballDisplayLabel($b),
            $currentOverBalls
        );

        $lastBall = $balls->last();
        $nextIsFreeHit = self::isFreeHitDelivery($lastBall);

        return [
            'over_number' => $overNumber,
            'balls_in_current_over' => $legalInCurrentOver,
            'over_complete' => $overComplete,
            'current_over_balls' => array_values($displayLabels),
            'next_is_free_hit' => $nextIsFreeHit,
        ];
    }

    /**
     * Produce a short display label for a single ball (used in current_over_balls arrays).
     * Examples: "0", "4", "6", "WD", "2WD", "NB", "3NB", "W", "B", "2LB", "RH", "P5"
     */
    public static function ballDisplayLabel(Ball $ball): string
    {
        $runs = (int) ($ball->runs ?? 0);

        if ($ball->is_wicket) {
            return $ball->isRetiredHurt() ? 'RH' : 'W';
        }
        if ($ball->isPenaltyOnlyAward()) {
            return 'P'.(int) ($ball->penalty_runs ?? 0);
        }
        if ($ball->is_wide) {
            $extra = max(1, $runs) - 1;

            return $extra > 0 ? $extra.'WD' : 'WD';
        }
        if ($ball->is_no_ball) {
            $extra = max(1, $runs) - 1;

            return $extra > 0 ? $extra.'NB' : 'NB';
        }
        if ($ball->is_bye) {
            return $runs > 1 ? $runs.'B' : 'B';
        }
        if ($ball->is_leg_bye) {
            return $runs > 1 ? $runs.'LB' : 'LB';
        }

        $label = (string) $runs;

        return $ball->is_free_hit ? $label.'*' : $label;
    }
}
