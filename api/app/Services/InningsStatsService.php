<?php

namespace App\Services;

use App\Enums\Event\DismissalTypeEnum;
use App\Enums\Event\PenaltyTeamEnum;
use App\Models\Ball;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\Broadcast\GraphicContextBuilder;
use App\Services\Broadcast\GraphicContextOrchestrator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

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
     * delivery — i.e. after applying all MCC strike-rotation rules:
     *
     *   • Odd runs off the bat on any delivery (fair, no-ball) → rotate.
     *   • Odd bye / leg-bye runs on any delivery (fair or no-ball) → rotate.
     *   • Odd runs beyond the wide penalty → rotate (batters physically ran).
     *   • Penalty-only / additional-runs-only awards → no rotation (not a delivery).
     *   • 6th legal delivery of an over with no odd-run rotation → change of ends.
     *   • Dismissal: incoming batter takes the vacant end; run-out crossing logic
     *     uses the post-run-rotation positions to determine the correct end.
     *   • Wicket on the last ball of an over → ALSO applies the change of ends.
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

            // Absorb the stored crease at the start of each delivery. This lets
            // manual scorer corrections propagate through historical re-computation.
            if ($ball->striker_id) {
                $sid = (int) $ball->striker_id;
            }
            if ($ball->non_striker_id) {
                $nid = (int) $ball->non_striker_id;
            }

            $isLegal = $ball->isLegalDelivery();

            if ($ball->is_wicket) {
                // Step 1 — rotate for any runs completed before the dismissal.
                [$sid, $nid] = self::applyOddRunRotation($ball, $sid, $nid);

                // Step 2 — resolve who occupies each end after the dismissal, using
                // the post-rotation positions so run-out end logic is accurate.
                [$sid, $nid] = self::creaseAfterDismissalBall($ball, $nextBall, $sid, $nid);

                // Step 3 — if this was the 6th legal ball, also change ends (the
                // new batter and surviving batter walk to the opposite ends for the
                // next over). The `continue` below would otherwise skip this.
                if ($isLegal) {
                    $legalInOver++;
                    if ($legalInOver === 6) {
                        $legalInOver = 0;
                        if ($sid && $nid) {
                            [$sid, $nid] = [$nid, $sid];
                        }
                    }
                }

                continue;
            }

            $oddRot = self::computeStrikeRotation($ball);

            if ($oddRot && $sid && $nid) {
                [$sid, $nid] = [$nid, $sid];
            }

            if ($isLegal) {
                $legalInOver++;
                if ($legalInOver === 6) {
                    // End of over: ALWAYS change ends. The odd-run rotation and the
                    // over-end change are independent — both always apply. Odd runs
                    // on the last ball mean the batters crossed once (oddRot), then
                    // change of ends crosses them again — net result: original striker
                    // faces the next over. Skipping the swap here when oddRot=true
                    // would leave the wrong batter on strike.
                    if ($sid && $nid) {
                        [$sid, $nid] = [$nid, $sid];
                    }
                    $legalInOver = 0;
                }
            }
        }

        return ['striker_id' => $sid, 'non_striker_id' => $nid];
    }

    /**
     * Determine whether a delivery causes a strike rotation.
     *
     * Cricket rotation rules (MCC Laws):
     *   – Normal delivery: odd runs off bat → rotate.
     *   – Bye / leg-bye (legal delivery): odd total runs → rotate (batters ran).
     *   – No-ball + runs off bat: odd runs off bat → rotate.
     *   – No-ball + bye / leg-bye: odd bye/LB runs (runs − 1 penalty) → rotate.
     *   – Wide: odd runs beyond the mandatory 1-run penalty → rotate.
     *   – Penalty-only / additional-runs-only awards: no delivery, no rotation.
     *
     * @internal Used by resolveCreaseAfterBalls and applyOddRunRotation.
     */
    private static function computeStrikeRotation(Ball $ball): bool
    {
        // Penalty-only / additional-runs-only awards are not deliveries; batters
        // do not run and the crease state must not change.
        if ($ball->isPenaltyOnlyAward() || $ball->isAdditionalRunsOnlyAward()) {
            return false;
        }

        // Wide delivery: the mandatory 1-run penalty does not involve running.
        // Any runs beyond the penalty (batters chose to run) determine rotation.
        if ($ball->is_wide) {
            $runsRun = max(0, (int) ($ball->runs ?? 0) - 1);

            return ($runsRun % 2) === 1;
        }

        // No-ball + bye or leg-bye: the 1-run NB penalty does not involve
        // running. The bye/LB runs (stored in runs − 1) determine rotation.
        if ($ball->is_no_ball && ($ball->is_bye || $ball->is_leg_bye)) {
            $byeRuns = max(0, (int) ($ball->runs ?? 0) - 1);

            return ($byeRuns % 2) === 1;
        }

        // No-ball + runs off bat: treat like a fair delivery for rotation
        // (the striker physically ran; the 1-run penalty is not a physical run).
        if ($ball->is_no_ball) {
            return (self::strikerRunsOffBat($ball) % 2) === 1;
        }

        // Bye or leg-bye on a fair delivery: total runs = physical runs run.
        if ($ball->is_bye || $ball->is_leg_bye) {
            return ((int) ($ball->runs ?? 0) % 2) === 1;
        }

        // Fair delivery: runs off the bat determine rotation.
        return (self::strikerRunsOffBat($ball) % 2) === 1;
    }

    /**
     * Player IDs dismissed in this innings (excludes retired_hurt — they may return).
     *
     * @param  Collection<int, Ball>  $balls
     * @return list<int>
     */
    public static function dismissedPlayerIdsFromBalls(Collection $balls): array
    {
        $ids = [];
        foreach ($balls as $ball) {
            if (! $ball->is_wicket || $ball->out_player_id === null) {
                continue;
            }
            if ($ball->isRetiredHurt()) {
                continue;
            }
            $ids[] = (int) $ball->out_player_id;
        }

        return array_values(array_unique($ids));
    }

    /**
     * Merge ball-history crease with pending_players, skipping dismissed pending IDs.
     *
     * @param  Collection<int, Ball>  $balls
     * @param  array<string, mixed>  $pending
     * @return array{striker_id: int|null, non_striker_id: int|null}
     */
    public static function resolveExpectedCrease(Collection $balls, array $pending): array
    {
        $dismissedIds = self::dismissedPlayerIdsFromBalls($balls);
        $crease = self::resolveCreaseAfterBalls($balls);

        return self::applyPendingCreaseSelection(
            $crease['striker_id'],
            $crease['non_striker_id'],
            $pending,
            $balls->isNotEmpty(),
            $dismissedIds,
        );
    }

    /**
     * Merge graphic_session pending_players onto crease resolved from ball history.
     *
     * Pre-innings: pending ids replace empty slots directly.
     * Mid-innings: when both pending batter ids match the two on-crease players,
     * treat them as an explicit striker / non-striker assignment (end swap).
     * Otherwise fill any vacant slot (incoming batter after a wicket).
     *
     * @param  array<string, mixed>  $pending
     * @param  list<int>  $dismissedIds  Out players who must not re-enter via pending.
     * @return array{striker_id: int|null, non_striker_id: int|null}
     */
    public static function applyPendingCreaseSelection(
        ?int $strikerId,
        ?int $nonStrikerId,
        array $pending,
        bool $inningsStarted,
        array $dismissedIds = [],
    ): array {
        if (! $inningsStarted) {
            if (! empty($pending['next_batter_id'])) {
                $id = (int) $pending['next_batter_id'];
                if (! in_array($id, $dismissedIds, true)) {
                    $strikerId = $id;
                }
            }
            if (! empty($pending['next_non_striker_id'])) {
                $id = (int) $pending['next_non_striker_id'];
                if (! in_array($id, $dismissedIds, true)) {
                    $nonStrikerId = $id;
                }
            }

            return ['striker_id' => $strikerId, 'non_striker_id' => $nonStrikerId];
        }

        $pendingStriker = ! empty($pending['next_batter_id']) ? (int) $pending['next_batter_id'] : null;
        $pendingNonStriker = ! empty($pending['next_non_striker_id']) ? (int) $pending['next_non_striker_id'] : null;

        if ($pendingStriker && $pendingNonStriker && $strikerId && $nonStrikerId) {
            $onCrease = [(int) $strikerId, (int) $nonStrikerId];
            sort($onCrease);
            $pendingPair = [$pendingStriker, $pendingNonStriker];
            sort($pendingPair);

            if ($onCrease === $pendingPair && $pendingStriker !== $pendingNonStriker) {
                return ['striker_id' => $pendingStriker, 'non_striker_id' => $pendingNonStriker];
            }
        }

        foreach (['next_batter_id', 'next_non_striker_id'] as $key) {
            if (empty($pending[$key])) {
                continue;
            }
            $id = (int) $pending[$key];
            if ($id <= 0 || in_array($id, $dismissedIds, true) || $strikerId === $id || $nonStrikerId === $id) {
                continue;
            }
            if ($strikerId === null) {
                $strikerId = $id;
            } elseif ($nonStrikerId === null) {
                $nonStrikerId = $id;
            }
        }

        return ['striker_id' => $strikerId, 'non_striker_id' => $nonStrikerId];
    }

    /**
     * Resolve the crease immediately after a dismissal ball.
     *
     * $sid / $nid are the POST-run-rotation positions — i.e. where each batter
     * physically is when the dismissal moment occurs. Using these (rather than
     * the delivery's stored striker_id) is essential for run-outs where runs
     * completed before the dismissal have already moved the batters.
     *
     * Run-out crossing rules:
     *   batter_crossed = false → out batter was dismissed at the end they started
     *                            from (they turned back or never fully committed).
     *   batter_crossed = true  → both batters fully crossed; out batter reached
     *                            the far end and was dismissed there; survivor is
     *                            therefore at the end the out batter vacated.
     *
     * @return array{0: int|null, 1: int|null} [next-striker, next-non-striker]
     */
    private static function creaseAfterDismissalBall(Ball $ball, ?Ball $nextBall, ?int $sid, ?int $nid): array
    {
        $outId = (int) ($ball->out_player_id ?? $ball->striker_id ?? 0);
        if ($outId === 0) {
            return [$sid, $nid];
        }

        // Determine which end the out batter occupies at the moment of dismissal,
        // based on the post-run-rotation crease ($sid = striker's end).
        $outAtStrikersEnd = ((int) $outId === (int) $sid);
        $survivor = $outAtStrikersEnd ? $nid : $sid;
        $nextId = self::incomingBatsmanIdFromNextBall($nextBall, $survivor);

        if ($ball->dismissal_type === DismissalTypeEnum::RUN_OUT && $ball->batter_crossed !== null) {
            if ((bool) $ball->batter_crossed) {
                // Batters crossed during the dismissal run: each batter reached the
                // far end, flipping their positions one more time.
                if ($outAtStrikersEnd) {
                    // Out batter crossed from striker's end → dismissed at non-striker's end.
                    // Survivor crossed from non-striker's end → now at striker's end → faces next.
                    // Incoming batter C fills the non-striker's end.
                    return [$survivor ?: null, $nextId ?: null];
                }

                // Out batter crossed from non-striker's end → dismissed at striker's end.
                // Survivor crossed from striker's end → now at non-striker's end.
                // Incoming batter C comes in at striker's end → faces next.
                return [$nextId ?: null, $survivor ?: null];
            }

            // Not crossed: out batter dismissed at the end they were already at.
            if ($outAtStrikersEnd) {
                // Out at striker's end: C takes that end → faces next.
                return [$nextId ?: null, $survivor ?: null];
            }

            // Out at non-striker's end: survivor stays at striker's end → faces next.
            return [$survivor ?: null, $nextId ?: null];
        }

        // All non-run-out dismissals (caught, bowled, LBW, stumped, hit-wicket,
        // mankad, obstructing, retired, timed-out, hit-ball-twice):
        // The ball ends at the striker's crease or due to the striker's action.
        if ($outAtStrikersEnd) {
            // Striker dismissed: incoming batter C takes the striker's end → faces next.
            return [$nextId ?: null, $survivor ?: null];
        }

        // Non-striker dismissed (mankad, obstructing at non-striker's end):
        // striker remains at striker's end → continues to face.
        return [$survivor ?: null, $nextId ?: null];
    }

    /**
     * Rotate strike for runs completed on a wicket delivery before the dismissal.
     * Uses the same rules as computeStrikeRotation so that run-outs on wides /
     * no-balls are handled correctly.
     *
     * @return array{0: int|null, 1: int|null}
     */
    private static function applyOddRunRotation(Ball $ball, ?int $sid, ?int $nid): array
    {
        if (! $sid || ! $nid) {
            return [$sid, $nid];
        }

        return self::computeStrikeRotation($ball) ? [$nid, $sid] : [$sid, $nid];
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
            // S11: the outer `is_bye || is_leg_bye` guard at lines above already
            // returned 0 before this branch — the inner check was unreachable dead code.
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

        /** @var array<int, Carbon|null> First ball timestamp when each batter arrived at the crease. */
        $creaseArrivalAt = [];

        foreach ($balls as $ball) {
            $isLegal = $ball->isLegalDelivery();
            $isBye = $ball->is_bye;
            $isLb = $ball->is_leg_bye;

            $deliveryRuns = (int) ($ball->runs ?? 0);
            $pr = (int) ($ball->penalty_runs ?? 0);
            $ar = (int) ($ball->additional_runs ?? 0);
            $penaltyTeam = $ball->penalty_team ?? PenaltyTeamEnum::BATTING->value;

            // ── Totals ────────────────────────────────────────────────────────
            $totalRuns += $deliveryRuns + $ar;
            if ($pr !== 0 && $penaltyTeam === PenaltyTeamEnum::BATTING->value) {
                // Positive → award; negative → deduction. Both are applied directly.
                $totalRuns += $pr;
            }
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
            if ($pr !== 0 && $penaltyTeam === PenaltyTeamEnum::BATTING->value) {
                $penaltyRuns += $pr;
            }

            // ── Batting ───────────────────────────────────────────────────────
            foreach (array_filter([$ball->striker_id, $ball->non_striker_id]) as $pid) {
                if ($pid && ! isset($creaseArrivalAt[$pid]) && $ball->created_at !== null) {
                    $creaseArrivalAt[$pid] = $ball->created_at;
                }
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
                        'dismissal_compact_label' => null,
                        'bowler_name' => null,
                        'fielder_name' => null,
                        'crease_time_seconds' => null,
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

                    if ($isRetiredHurt) {
                        unset($creaseArrivalAt[$outId]);
                    } elseif (
                        isset($creaseArrivalAt[$outId], $batsmenStats[$outId])
                        && $ball->created_at !== null
                    ) {
                        $batsmenStats[$outId]['crease_time_seconds'] = max(
                            0,
                            $creaseArrivalAt[$outId]->diffInSeconds($ball->created_at),
                        );
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
                // (run_out, obstructing_the_field, hit_ball_twice are fielding
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
            'crease_time_seconds' => $batsmenStats[$id]['crease_time_seconds'],
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

        $result = [
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
            'batting_by_id' => $batsmenStats,
            'bowling_by_id' => $bowlerStats,
        ];

        return $result;
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
     * Examples: "0", "4", "6", "WD", "2WD", "NB", "3NB", "W", "1B", "2LB", "RH", "P5"
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
        if ($ball->isAdditionalRunsOnlyAward()) {
            return '+'.(int) ($ball->additional_runs ?? 0);
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
            return $runs > 0 ? $runs.'B' : 'B';
        }
        if ($ball->is_leg_bye) {
            return $runs > 0 ? $runs.'LB' : 'LB';
        }

        $label = (string) $runs;

        return $ball->is_free_hit ? $label.'*' : $label;
    }

    /**
     * Penalty runs awarded to the bowling side during an innings are stored on that
     * innings' ball rows but credited when that team bats (same or later innings).
     *
     * S14: loadMissing is skipped when both innings and balls are already loaded by
     * the caller (e.g. MatchCompletionService which has balls pre-fetched), avoiding
     * redundant I/O on every evaluate() call.
     */
    public static function crossInningsPenaltyRunsForBattingTeam(TournamentMatch $match, int $battingTeamId): int
    {
        // Only load if innings or their balls are not already in memory.
        if (! $match->relationLoaded('innings') || $match->innings->contains(fn ($i) => ! $i->relationLoaded('balls'))) {
            $match->loadMissing(['innings.balls']);
        }

        $sum = 0;
        foreach ($match->innings as $inn) {
            if ((int) $inn->bowling_team_id !== $battingTeamId) {
                continue;
            }
            foreach ($inn->balls as $ball) {
                if (($ball->penalty_team ?? PenaltyTeamEnum::BATTING->value) !== PenaltyTeamEnum::BOWLING->value) {
                    continue;
                }
                $sum += (int) ($ball->penalty_runs ?? 0);
            }
        }

        return $sum;
    }

    /**
     * Apply cross-innings penalty credits to computed innings stats.
     *
     * @param  array<string, mixed>  $stats
     * @return array<string, mixed>
     */
    public static function applyCrossInningsPenalties(array $stats, int $crossPenaltyRuns): array
    {
        if ($crossPenaltyRuns <= 0) {
            return $stats;
        }

        $stats['total_runs'] = (int) ($stats['total_runs'] ?? 0) + $crossPenaltyRuns;
        $extras = $stats['extras_breakdown'] ?? [];
        $penalty = (int) ($extras['penalty_runs'] ?? 0) + $crossPenaltyRuns;
        $stats['extras_breakdown'] = array_merge($extras, [
            'penalty_runs' => $penalty,
            'total' => (int) ($extras['wides'] ?? 0)
                + (int) ($extras['no_balls'] ?? 0)
                + (int) ($extras['byes'] ?? 0)
                + (int) ($extras['leg_byes'] ?? 0)
                + $penalty,
        ]);

        return $stats;
    }

    /**
     * S16: Resolve the live crease (striker, non-striker, bowler) from ball history
     * plus a pending_players snapshot, returning null when any slot is unfilled.
     *
     * Extracted from the duplicated private helpers in AdditionalRunsController and
     * MatchSubstituteController so all crease-resolution logic lives in one place.
     *
     * @param  Collection<int, Ball>  $balls  Pre-sorted ball history for the active innings.
     * @param  array<string, mixed>  $pending  graphic_session.pending_players snapshot.
     * @return array{striker_id: int, non_striker_id: int, bowler_id: int}|null
     */
    public static function resolveLiveCrease(Collection $balls, array $pending): ?array
    {
        $overDetails = self::currentOverDetails($balls);
        $crease = self::resolveCreaseAfterBalls($balls);
        $strikerId = $crease['striker_id'];
        $nonStrikerId = $crease['non_striker_id'];
        $bowlerId = $balls->last()?->bowler_id;

        if ($balls->isEmpty()) {
            $merged = self::applyPendingCreaseSelection($strikerId, $nonStrikerId, $pending, false, self::dismissedPlayerIdsFromBalls($balls));
            $strikerId = $merged['striker_id'];
            $nonStrikerId = $merged['non_striker_id'];
            if (! empty($pending['next_bowler_id'])) {
                $bowlerId = (int) $pending['next_bowler_id'];
            }
        } else {
            if ($overDetails['over_complete'] && ! empty($pending['next_bowler_id'])) {
                $bowlerId = (int) $pending['next_bowler_id'];
            }
            $merged = self::applyPendingCreaseSelection($strikerId, $nonStrikerId, $pending, true, self::dismissedPlayerIdsFromBalls($balls));
            $strikerId = $merged['striker_id'];
            $nonStrikerId = $merged['non_striker_id'];
        }

        if (! empty($pending['substitute_replaced_id']) && ! empty($pending['substitute_player_id'])) {
            $replaced = (int) $pending['substitute_replaced_id'];
            $sub = (int) $pending['substitute_player_id'];
            if ($strikerId === $replaced) {
                $strikerId = $sub;
            } elseif ($nonStrikerId === $replaced) {
                $nonStrikerId = $sub;
            }
        }

        if ($strikerId === null || $nonStrikerId === null || $bowlerId === null) {
            return null;
        }

        return [
            'striker_id' => (int) $strikerId,
            'non_striker_id' => (int) $nonStrikerId,
            'bowler_id' => (int) $bowlerId,
        ];
    }
}
