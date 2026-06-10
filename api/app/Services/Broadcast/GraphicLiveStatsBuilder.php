<?php

namespace App\Services\Broadcast;

use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Services\InningsStatsService;
use App\Services\PlayerStatsService;
use Illuminate\Support\Collection;

/**
 * Live innings stats, ball windows, win probability, and per-innings chart data
 * for the graphic overlay `context` blob.
 */
final class GraphicLiveStatsBuilder
{
    public function __construct(
        private readonly PlayerStatsService $statsService,
        private readonly InningsStatsService $inningsStats,
        private readonly WinProbabilitySimilarSituationsService $winProbability,
    ) {}

    /**
     * Current over (ball chips), crease batters, bowler, and previous-over runs —
     * shared by {@see buildLive()} and first-innings “at same stage” mirror.
     *
     * @param  array<string, mixed>  $stats  InningsStatsService::compute() for the same $balls
     * @return array{
     *   current_over_balls: list<string>,
     *   current_over_models: list<Ball>,
     *   batters: list<array{id: int, team_id?: int, name: string, runs: int, balls: int, ones: int, twos: int, threes: int, fours: int, sixes: int, dots: int, on_strike: bool, is_dismissed: bool}>,
     *   bowler: array{name: string, figures: string, overs: string, user_id?: int|null, team_id?: int|null, runs_conceded?: int, balls_bowled?: int, dots?: int, wickets?: int, economy?: string|null},
     *   previous_over_runs: int
     * }
     */
    private function graphicOverBattersBowlerStrip(
        Collection $balls,
        array $stats,
        array $playerNames,
        array $pending,
        ?int $battingTeamId = null,
        ?int $bowlingTeamId = null,
    ): array {
        // No deliveries yet: crease + bowler come only from `pending_players`
        // (scorer picks openers / bowler before the first ball is recorded).
        if ($balls->isEmpty()) {
            $strikeId = ! empty($pending['next_batter_id']) ? (int) $pending['next_batter_id'] : null;
            $batters = [];
            if (! empty($pending['next_batter_id'])) {
                $id = (int) $pending['next_batter_id'];
                $row = [
                    'id' => $id,
                    'name' => $playerNames[$id] ?? '',
                    'runs' => 0,
                    'balls' => 0,
                    'fours' => 0,
                    'sixes' => 0,
                    'ones' => 0,
                    'twos' => 0,
                    'threes' => 0,
                    'dots' => 0,
                    'on_strike' => $strikeId !== null && $id === $strikeId,
                    'is_dismissed' => false,
                ];
                if ($battingTeamId !== null) {
                    $row['team_id'] = $battingTeamId;
                }
                $batters[] = $row;
            }
            if (! empty($pending['next_non_striker_id'])) {
                $id = (int) $pending['next_non_striker_id'];
                $row = [
                    'id' => $id,
                    'name' => $playerNames[$id] ?? '',
                    'runs' => 0,
                    'balls' => 0,
                    'fours' => 0,
                    'sixes' => 0,
                    'ones' => 0,
                    'twos' => 0,
                    'threes' => 0,
                    'dots' => 0,
                    'on_strike' => $strikeId !== null && $id === $strikeId,
                    'is_dismissed' => false,
                ];
                if ($battingTeamId !== null) {
                    $row['team_id'] = $battingTeamId;
                }
                $batters[] = $row;
            }
            $bowler = ['name' => '', 'figures' => '', 'overs' => ''];
            if (! empty($pending['next_bowler_id'])) {
                $bid = (int) $pending['next_bowler_id'];
                $bowler = [
                    'name' => $playerNames[$bid] ?? '',
                    'figures' => '0/0',
                    'overs' => InningsStatsService::oversDisplay(0),
                    'user_id' => $bid,
                    'runs_conceded' => 0,
                    'balls_bowled' => 0,
                    'dots' => 0,
                    'wickets' => 0,
                    'economy' => '—',
                ];
                if ($bowlingTeamId !== null) {
                    $bowler['team_id'] = $bowlingTeamId;
                }
            }

            return [
                'current_over_balls' => [],
                'current_over_models' => [],
                'batters' => $batters,
                'bowler' => $bowler,
                'previous_over_runs' => 0,
            ];
        }

        $dismissedIds = $stats['dismissed_ids'];
        $batsmenById = $stats['batting_by_id'];
        $bowlerById = $stats['bowling_by_id'];

        $currentOverBalls = [];
        $previousOverRuns = 0;
        $currentOverRuns = 0;
        $legalInCurrentOver = 0;

        foreach ($balls as $ball) {
            $isLegal = $ball->isLegalDelivery();
            $ballRuns = ($ball->runs ?? 0) + ($ball->penalty_runs ?? 0) + ($ball->additional_runs ?? 0);

            $currentOverBalls[] = $ball;
            $currentOverRuns += $ballRuns;

            if ($isLegal && ++$legalInCurrentOver === 6) {
                $previousOverRuns = $currentOverRuns;
                $currentOverBalls = [];
                $currentOverRuns = 0;
                $legalInCurrentOver = 0;
            }
        }

        $creaseA = null;
        $creaseB = null;

        foreach ($balls->reverse() as $b) {
            foreach ([$b->striker_id, $b->non_striker_id] as $pid) {
                if (! $pid || in_array($pid, $dismissedIds, true)) {
                    continue;
                }
                if ($creaseA === null) {
                    $creaseA = $pid;
                } elseif ($pid !== $creaseA && $creaseB === null) {
                    $creaseB = $pid;
                    break 2;
                }
            }
        }

        $creaseIds = array_values(array_filter([$creaseA, $creaseB]));

        if (! empty($pending['next_batter_id']) && count($creaseIds) < 2) {
            $nextBatterId = (int) $pending['next_batter_id'];
            if (! in_array($nextBatterId, $dismissedIds, true) && ! in_array($nextBatterId, $creaseIds, true)) {
                $creaseIds[] = $nextBatterId;
            }
        }

        if (! empty($pending['next_non_striker_id']) && count($creaseIds) < 2) {
            $nextNonStrikerId = (int) $pending['next_non_striker_id'];
            if (! in_array($nextNonStrikerId, $dismissedIds, true) && ! in_array($nextNonStrikerId, $creaseIds, true)) {
                $creaseIds[] = $nextNonStrikerId;
            }
        }

        if (! empty($pending['substitute_replaced_id']) && ! empty($pending['substitute_player_id'])) {
            $replaced = (int) $pending['substitute_replaced_id'];
            $sub = (int) $pending['substitute_player_id'];
            $creaseIds = array_values(array_map(
                static fn (int $id) => $id === $replaced ? $sub : $id,
                $creaseIds,
            ));
        }

        foreach ($creaseIds as $id) {
            if (! isset($batsmenById[$id])) {
                $batsmenById[$id] = ['runs' => 0, 'balls' => 0, 'ones' => 0, 'twos' => 0, 'threes' => 0, 'fours' => 0, 'sixes' => 0, 'dots' => 0];
            }
        }

        $strikeId = isset($stats['current_striker_id']) ? (int) $stats['current_striker_id'] : null;
        if ($strikeId === 0) {
            $strikeId = null;
        }

        $batters = array_map(function ($id) use ($playerNames, $batsmenById, $strikeId, $battingTeamId, $dismissedIds) {
            $id = (int) $id;

            $row = [
                'id' => $id,
                'name' => $playerNames[$id] ?? '',
                'runs' => $batsmenById[$id]['runs'] ?? 0,
                'balls' => $batsmenById[$id]['balls'] ?? 0,
                'ones' => $batsmenById[$id]['ones'] ?? 0,
                'twos' => $batsmenById[$id]['twos'] ?? 0,
                'threes' => $batsmenById[$id]['threes'] ?? 0,
                'fours' => $batsmenById[$id]['fours'] ?? 0,
                'sixes' => $batsmenById[$id]['sixes'] ?? 0,
                'dots' => $batsmenById[$id]['dots'] ?? 0,
                'on_strike' => $strikeId !== null && $id === $strikeId,
                'is_dismissed' => in_array($id, $dismissedIds, true),
            ];
            if ($battingTeamId !== null) {
                $row['team_id'] = $battingTeamId;
            }

            return $row;
        }, $creaseIds);

        $lastBowlerId = $balls->last()?->bowler_id;

        if ($currentOverBalls === [] && ! empty($pending['next_bowler_id'])) {
            $pendingBowlerId = (int) $pending['next_bowler_id'];
            if (! isset($bowlerById[$pendingBowlerId])) {
                $bowlerById[$pendingBowlerId] = ['balls' => 0, 'runs' => 0, 'wickets' => 0, 'maidens' => 0, 'dots' => 0];
            }
            $lastBowlerId = $pendingBowlerId;
        }

        $bowler = ['name' => '', 'figures' => '', 'overs' => ''];
        if ($lastBowlerId && isset($bowlerById[$lastBowlerId])) {
            $bws = $bowlerById[$lastBowlerId];
            $ballsBowled = (int) ($bws['balls'] ?? 0);
            $runsConc = (int) ($bws['runs'] ?? 0);
            $wkts = (int) ($bws['wickets'] ?? 0);
            $dotsBowled = (int) ($bws['dots'] ?? 0);
            $economyStr = $ballsBowled > 0
                ? number_format(round($runsConc / ($ballsBowled / 6), 2), 2)
                : '—';
            $bowler = [
                'name' => $playerNames[$lastBowlerId] ?? '',
                'figures' => "{$wkts}/{$runsConc}",
                'overs' => InningsStatsService::oversDisplay($ballsBowled),
                'user_id' => (int) $lastBowlerId,
                'runs_conceded' => $runsConc,
                'balls_bowled' => $ballsBowled,
                'dots' => $dotsBowled,
                'wickets' => $wkts,
                'economy' => $economyStr,
            ];
            if ($bowlingTeamId !== null) {
                $bowler['team_id'] = $bowlingTeamId;
            }
        }

        $currentOverDisplay = array_map(static function (Ball $b): string {
            $runs = (int) ($b->runs ?? 0);

            if ($b->is_wicket) {
                return $b->isRetiredHurt() ? 'RH' : 'W';
            }
            if ($b->isPenaltyOnlyAward()) {
                return 'P'.(int) ($b->penalty_runs ?? 0);
            }
            if ($b->isAdditionalRunsOnlyAward()) {
                return '+'.(int) ($b->additional_runs ?? 0);
            }
            if ($b->is_wide) {
                $extra = max(1, $runs) - 1;

                return $extra > 0 ? $extra.'WD' : 'WD';
            }
            if ($b->is_no_ball) {
                $extra = max(1, $runs) - 1;

                return $extra > 0 ? $extra.'NB' : 'NB';
            }
            if ($b->is_bye) {
                return $runs > 0 ? $runs.'B' : 'B';
            }
            if ($b->is_leg_bye) {
                return $runs > 0 ? $runs.'LB' : 'LB';
            }

            $label = match (true) {
                $runs === 4 => '4',
                $runs === 6 => '6',
                $runs > 0 => (string) $runs,
                default => '0',
            };

            return $b->is_free_hit ? $label.'*' : $label;
        }, $currentOverBalls);

        return [
            'current_over_balls' => array_values($currentOverDisplay),
            'current_over_models' => array_values($currentOverBalls),
            'batters' => array_values($batters),
            'bowler' => $bowler,
            'previous_over_runs' => $previousOverRuns,
        ];
    }

    /**
     * Right-hand column for AT_STAGE: during 1st innings = fielding (bowling)
     * team + same over + bowler; during 2nd innings = 1st-innings snapshot at
     * the same legal-ball depth as the chase.
     *
     * @param  array<string, mixed>  $strip  {@see graphicOverBattersBowlerStrip()} for the active innings
     * @param  array{name: string, figures: string, overs: string}  $bowler
     * @return array<string, mixed>|null
     */
    private function buildAtStageMirror(
        TournamentMatch $match,
        Innings $active,
        ?Innings $first,
        int $activeLegalBalls,
        string $activeBattingTeamKey,
        array $strip,
        string $oversDisplay,
        array $bowler,
        string $activeScoreLine,
    ): ?array {
        if ((int) $active->innings_number === 1) {
            $bowlingTeamKey = $activeBattingTeamKey === 'home' ? 'away' : 'home';

            return [
                'batting_team' => $bowlingTeamKey,
                'score' => $activeScoreLine,
                'overs' => $oversDisplay,
                'batters' => [],
                'bowler' => $bowler,
                'current_over_balls' => $strip['current_over_balls'],
                'innings_label' => 'Fielding',
            ];
        }

        if ($first === null) {
            return null;
        }

        $battingTeamKey = (int) $first->batting_team_id === (int) $match->home_team_id
            ? 'home'
            : 'away';

        if ($activeLegalBalls <= 0) {
            return [
                'batting_team' => $battingTeamKey,
                'score' => '0-0',
                'overs' => InningsStatsService::oversDisplay(0),
                'batters' => [],
                'bowler' => ['name' => '', 'figures' => '', 'overs' => ''],
                'current_over_balls' => [],
                'innings_label' => '1st Innings',
            ];
        }

        $firstBalls = $first->balls;
        if ($firstBalls->isEmpty()) {
            return null;
        }

        $prefix = collect();
        $legal = 0;
        foreach ($firstBalls as $b) {
            $prefix->push($b);
            if ($b->isLegalDelivery()) {
                $legal++;
            }
            if ($legal >= $activeLegalBalls) {
                break;
            }
        }

        $mirrorNames = InningsStatsService::namesFromDatabase($prefix, []);
        $mirrorStats = $this->inningsStats->compute($prefix, $mirrorNames);
        $stripMirror = $this->graphicOverBattersBowlerStrip(
            $prefix,
            $mirrorStats,
            $mirrorNames,
            [],
            (int) $first->batting_team_id,
            (int) $first->bowling_team_id,
        );

        return [
            'batting_team' => $battingTeamKey,
            'score' => "{$mirrorStats['total_runs']}-{$mirrorStats['total_wickets']}",
            'overs' => InningsStatsService::oversDisplay((int) $mirrorStats['legal_balls']),
            'batters' => $stripMirror['batters'],
            'bowler' => $stripMirror['bowler'],
            'current_over_balls' => $stripMirror['current_over_balls'],
            'innings_label' => '1st Innings',
        ];
    }

    /**
     * @param  array<int, string>  $playerNames
     */
    public function buildLive(
        TournamentMatch $match,
        Innings $active,
        ?Innings $first,
        array $playerNames,
        array $pending = [],
    ): array {
        /** @var Collection<int, Ball> $balls */
        $balls = $active->balls;

        $battingTeamKey = (int) $active->batting_team_id === (int) $match->home_team_id
            ? 'home'
            : 'away';

        // ── Centralized stats (single pass) ──────────────────────────────────
        $stats = $this->inningsStats->compute($balls, $playerNames);
        $totalRuns = $stats['total_runs'];
        $totalWickets = $stats['total_wickets'];
        $legalBalls = $stats['legal_balls'];

        $strip = $this->graphicOverBattersBowlerStrip(
            $balls,
            $stats,
            $playerNames,
            $pending,
            (int) $active->batting_team_id,
            (int) $active->bowling_team_id,
        );
        $currentOverDisplay = $strip['current_over_balls'];
        $currentOverBallModels = $strip['current_over_models'];
        $batters = $strip['batters'];
        $bowler = $strip['bowler'];
        $previousOverRuns = $strip['previous_over_runs'];

        // ── Fall of wickets in graphic format ─────────────────────────────────
        // Convert from shared {wicket_number, batsman_name, score, overs}
        // to graphic {number: ordinal, score: string}.

        $fowOrdinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        $fallOfWickets = array_map(fn ($fow, $i) => [
            'number' => $fowOrdinals[$i] ?? "{$fow['wicket_number']}th",
            'score' => (string) $fow['score'],
        ], $stats['fall_of_wickets'], array_keys($stats['fall_of_wickets']));

        // ── Overs / score / run rate ──────────────────────────────────────────

        $oversDisplay = InningsStatsService::oversDisplay($legalBalls);
        $currentRR = InningsStatsService::runRate($totalRuns, $legalBalls, 1);

        // ── Partnership ───────────────────────────────────────────────────────

        $partnershipRuns = 0;
        $partnershipBalls = 0;
        $partnerships = $this->statsService->partnershipsForInnings($active->id, $balls);
        $currentStand = collect($partnerships)->last(fn ($p) => $p['wicket_number'] === null);
        if ($currentStand) {
            $partnershipRuns = (int) $currentStand['runs'];
            $partnershipBalls = (int) $currentStand['balls'];
        }

        // ── Target / required rate (2nd innings) ──────────────────────────────

        $target = null;
        $runsToWin = null;
        $ballsRemaining = null;
        $requiredRR = '';

        if ((int) $active->innings_number === 2 && $first !== null) {
            // Use InningsStatsService so the target matches the scorecard API exactly
            // (penalty_runs are included in total_runs but NOT in a plain ->sum('runs')).
            // S18: resolve names from DB so name fields are populated (not empty strings).
            $firstBalls = $first->balls;
            $firstNames = InningsStatsService::namesFromDatabase($firstBalls);
            $firstStats = $this->inningsStats->compute($firstBalls, $firstNames);
            $firstInningsRuns = $firstStats['total_runs'];
            $target = $match->chaseTargetForSecondInnings($firstInningsRuns);
            $runsToWin = max(0, $target - $totalRuns);
            $maxBalls = (int) $match->overs * 6;
            $ballsRemaining = max(0, $maxBalls - $legalBalls);
            $requiredRR = $ballsRemaining > 0
                ? number_format($runsToWin / ($ballsRemaining / 6), 1)
                : '';
        }

        $winProbability = null;
        if ((int) $active->innings_number === 2 && $first !== null) {
            $requiredRrFloat = ($ballsRemaining ?? 0) > 0 && $runsToWin !== null
                ? ($runsToWin / ($ballsRemaining / 6.0))
                : 0.0;
            $currentRrFloat = (float) str_replace(',', '', (string) $currentRR);

            $winProbability = $this->winProbability->estimate(
                $match,
                $totalWickets,
                $battingTeamKey,
                $runsToWin,
                $ballsRemaining,
                $currentRrFloat,
                $requiredRrFloat,
            );
        }

        return [
            'innings_number' => (int) $active->innings_number,
            'batting_team' => $battingTeamKey,
            'score' => "{$totalRuns}-{$totalWickets}",
            'overs' => $oversDisplay,
            'batters' => array_values($batters),
            'bowler' => $bowler,
            'current_over_balls' => array_values($currentOverDisplay),
            'partnership' => ['runs' => $partnershipRuns, 'balls' => $partnershipBalls],
            'target' => $target,
            'runs_to_win' => $runsToWin,
            'balls_remaining' => $ballsRemaining,
            'current_rr' => $currentRR,
            'required_rr' => $requiredRR,
            'win_probability' => $winProbability,
            'fall_of_wickets' => $fallOfWickets,
            'previous_over' => ['runs' => $previousOverRuns],
            'last_12_balls' => $this->computeBallStats($balls, 12),
            'last_30_balls' => $this->computeBallStats($balls, 30),
            'this_over' => $this->computeBallStats(collect($currentOverBallModels), null),
            'at_stage_mirror' => $this->buildAtStageMirror(
                $match,
                $active,
                $first,
                $legalBalls,
                $battingTeamKey,
                $strip,
                $oversDisplay,
                $bowler,
                "{$totalRuns}-{$totalWickets}",
            ),
        ];
    }

    /**
     * Compute summary stats (dots, fours, sixes, wickets, runs) for a window of balls.
     *
     * When $count is null, all balls in the collection are used (e.g. current over).
     * When $count is given, only the last $count *legal* deliveries are considered.
     *
     * @param  Collection<int, Ball>  $allBalls
     * @param  int|null  $count  number of legal deliveries to look back, or null for all
     * @return array{dots:int, fours:int, sixes:int, wickets:int, runs:int}
     */
    private function computeBallStats(Collection $allBalls, ?int $count): array
    {
        if ($count !== null) {
            // Slice from the last $count legal deliveries.
            $legal = $allBalls->filter(fn (Ball $b) => $b->isLegalDelivery())->values();
            $window = $legal->slice(max(0, $legal->count() - $count));
        } else {
            // Current over — use every ball in the collection as-is.
            $window = $allBalls;
        }

        $dots = 0;
        $fours = 0;
        $sixes = 0;
        $wickets = 0;
        $runs = 0;

        foreach ($window as $ball) {
            $ballRuns = ($ball->runs ?? 0) + ($ball->penalty_runs ?? 0) + ($ball->additional_runs ?? 0);

            $runs += $ballRuns;

            if ($ball->is_wicket && ! $ball->isRetiredHurt()) {
                $wickets++;
            }

            $rob = InningsStatsService::strikerRunsOffBat($ball);
            if ($rob === 4) {
                $fours++;
            } elseif ($rob === 6) {
                $sixes++;
            } elseif ($ballRuns === 0 && ! $ball->is_wide && ! $ball->is_no_ball && ! $ball->is_wicket) {
                $dots++;
            }
        }

        return compact('dots', 'fours', 'sixes', 'wickets', 'runs');
    }

    /**
     * Build per-innings chart data for all innings in the match.
     *
     * Each entry contains:
     *   - innings_number, batting_team ("home"|"away")
     *   - overs_breakdown: [{over, runs, cumulative, wickets}]  — one entry per completed or in-progress over
     *   - total_runs, total_wickets, display_overs, fours, sixes
     *
     * Used by buildGraphicProps to generate chartSeries, summaryCards, and overCategories
     * for WORM, RUN_RATE_CHART (line), and MANHATTAN graphics.
     *
     * @param  Collection<int, Innings>  $innings
     * @return array<int, array<string, mixed>>
     */
    public function buildInningsChart(TournamentMatch $match, Collection $innings): array
    {
        $result = [];

        foreach ($innings as $inn) {
            /** @var Collection<int, Ball> $balls */
            $balls = $inn->balls;
            if ($balls->isEmpty()) {
                continue;
            }

            $battingTeamKey = (int) $inn->batting_team_id === (int) $match->home_team_id
                ? 'home'
                : 'away';

            $teamName = $battingTeamKey === 'home'
                ? ($match->homeTeam?->name ?? 'Home')
                : ($match->awayTeam?->name ?? 'Away');

            // Group balls by completed overs (1-indexed for display).
            $overRuns = [];   // over_index (0-based) => total runs
            $overWickets = [];   // over_index (0-based) => wickets
            $overValidBalls = [];   // over_index (0-based) => legal deliveries
            $overFours = [];   // over_index (0-based) => 4s in over
            $overSixes = [];   // over_index (0-based) => 6s in over
            $validBalls = 0;
            $totalRuns = 0;
            $totalWickets = 0;
            $fours = 0;
            $sixes = 0;

            foreach ($balls as $ball) {
                $isLegal = $ball->isLegalDelivery();
                $ballRuns = ($ball->runs ?? 0) + ($ball->penalty_runs ?? 0) + ($ball->additional_runs ?? 0);

                $currentOverIdx = (int) floor($validBalls / 6);

                if (! isset($overRuns[$currentOverIdx])) {
                    $overRuns[$currentOverIdx] = 0;
                    $overWickets[$currentOverIdx] = 0;
                    $overValidBalls[$currentOverIdx] = 0;
                    $overFours[$currentOverIdx] = 0;
                    $overSixes[$currentOverIdx] = 0;
                }
                $overRuns[$currentOverIdx] += $ballRuns;

                if ($ball->is_wicket && ! $ball->isRetiredHurt()) {
                    $overWickets[$currentOverIdx] = ($overWickets[$currentOverIdx] ?? 0) + 1;
                    $totalWickets++;
                }

                $totalRuns += $ballRuns;

                if ($isLegal) {
                    $overValidBalls[$currentOverIdx]++;
                    $validBalls++;
                }

                $runsOffBat = InningsStatsService::strikerRunsOffBat($ball);
                if ($runsOffBat === 4) {
                    $overFours[$currentOverIdx]++;
                    $fours++;
                } elseif ($runsOffBat === 6) {
                    $overSixes[$currentOverIdx]++;
                    $sixes++;
                }
            }

            // Build per-over breakdown with cumulative runs.
            $overs_breakdown = [];
            $cumulative = 0;
            foreach ($overRuns as $idx => $runs) {
                $cumulative += $runs;
                $vb = $overValidBalls[$idx] ?? 6;
                $overRunRate = $vb > 0 ? round(($runs / $vb) * 6, 2) : 0.0;
                $overs_breakdown[] = [
                    'over' => $idx + 1,
                    'runs' => $runs,
                    'cumulative' => $cumulative,
                    'wickets' => $overWickets[$idx] ?? 0,
                    'valid_balls' => $vb,
                    'run_rate' => $overRunRate,
                    'fours' => $overFours[$idx] ?? 0,
                    'sixes' => $overSixes[$idx] ?? 0,
                ];
            }

            $displayOvers = InningsStatsService::oversDisplay($validBalls);

            $result[] = [
                'innings_number' => (int) $inn->innings_number,
                'batting_team' => $battingTeamKey,
                'team_name' => $teamName,
                'overs_breakdown' => $overs_breakdown,
                'total_runs' => $totalRuns,
                'total_wickets' => $totalWickets,
                'display_overs' => $displayOvers,
                'fours' => $fours,
                'sixes' => $sixes,
            ];
        }

        return $result;
    }
}
