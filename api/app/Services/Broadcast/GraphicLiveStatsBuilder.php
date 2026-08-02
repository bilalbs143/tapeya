<?php

namespace App\Services\Broadcast;

use App\Models\Ball;
use App\Models\Innings;
use App\Models\TournamentMatch;
use App\Services\InningsStatsService;
use App\Services\PlayerStatsService;
use App\Support\BallDelivery\BallDeliveryPresenter;
use App\Support\Broadcast\BowlingFiguresFormatter;
use App\Support\Media\MediaDisk;
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
     *   current_over_deliveries: list<array<string, mixed>>,
     *   current_over_ball_models: list<Ball>,
     *   batters: list<array{id: int, team_id?: int, name: string, runs: int, balls: int, ones: int, twos: int, threes: int, fours: int, sixes: int, dots: int, on_strike: bool, is_dismissed: bool}>,
     *   bowler: array{name: string, figures: string, overs: string, user_id?: int|null, team_id?: int|null, runs_conceded?: int, balls_bowled?: int, dots?: int, wickets?: int, economy?: string|null},
     *   previous_over_runs: int,
     *   previous_over_wickets: int
     * }
     */
    private function graphicOverBattersBowlerStrip(
        Collection $balls,
        array $stats,
        array $playerNames,
        array $pending,
        ?int $battingTeamId = null,
        ?int $bowlingTeamId = null,
        array $playerPhotos = [],
    ): array {
        // No deliveries yet: crease + bowler come from matches.pending_crease
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
                    'avatar_url' => $playerPhotos[$id] ?? null,
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
                    'avatar_url' => $playerPhotos[$id] ?? null,
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
                    'figures' => BowlingFiguresFormatter::format(0, 0),
                    'overs' => InningsStatsService::oversDisplay(0),
                    'user_id' => $bid,
                    'runs_conceded' => 0,
                    'balls_bowled' => 0,
                    'dots' => 0,
                    'wickets' => 0,
                    'economy' => '—',
                    'avatar_url' => $playerPhotos[$bid] ?? null,
                ];
                if ($bowlingTeamId !== null) {
                    $bowler['team_id'] = $bowlingTeamId;
                }
            }

            return [
                'current_over_deliveries' => [],
                'current_over_ball_models' => [],
                'batters' => $batters,
                'bowler' => $bowler,
                'previous_over_runs' => 0,
                'previous_over_wickets' => 0,
            ];
        }

        $dismissedIds = $stats['dismissed_ids'];
        $batsmenById = $stats['batting_by_id'];
        $bowlerById = $stats['bowling_by_id'];

        $currentOverBalls = [];
        $previousOverRuns = 0;
        $previousOverWickets = 0;
        $currentOverRuns = 0;
        $currentOverWickets = 0;
        $legalInCurrentOver = 0;

        foreach ($balls as $ball) {
            $isLegal = $ball->isLegalDelivery();
            $ballRuns = ($ball->runs ?? 0) + ($ball->penalty_runs ?? 0) + ($ball->additional_runs ?? 0);

            $currentOverBalls[] = $ball;
            $currentOverRuns += $ballRuns;
            if ($ball->is_wicket) {
                $currentOverWickets++;
            }

            if ($isLegal && ++$legalInCurrentOver === 6) {
                $previousOverRuns = $currentOverRuns;
                $previousOverWickets = $currentOverWickets;
                $currentOverBalls = [];
                $currentOverRuns = 0;
                $currentOverWickets = 0;
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

        $batters = array_map(function ($id) use ($playerNames, $playerPhotos, $batsmenById, $strikeId, $battingTeamId, $dismissedIds) {
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
                'avatar_url' => $playerPhotos[$id] ?? null,
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
                'figures' => BowlingFiguresFormatter::format($wkts, $runsConc),
                'overs' => InningsStatsService::oversDisplay($ballsBowled),
                'user_id' => (int) $lastBowlerId,
                'runs_conceded' => $runsConc,
                'balls_bowled' => $ballsBowled,
                'dots' => $dotsBowled,
                'wickets' => $wkts,
                'economy' => $economyStr,
                'avatar_url' => $playerPhotos[(int) $lastBowlerId] ?? null,
            ];
            if ($bowlingTeamId !== null) {
                $bowler['team_id'] = $bowlingTeamId;
            }
        }

        $currentOverDeliveries = array_map(
            static fn (Ball $b): array => BallDeliveryPresenter::toDelivery($b),
            $currentOverBalls,
        );

        return [
            'current_over_deliveries' => array_values($currentOverDeliveries),
            'current_over_ball_models' => array_values($currentOverBalls),
            'batters' => array_values($batters),
            'bowler' => $bowler,
            'previous_over_runs' => $previousOverRuns,
            'previous_over_wickets' => $previousOverWickets,
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
            return null;
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
                'current_over_deliveries' => [],
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

        $mirrorPlayers = InningsStatsService::playersFromDatabase($prefix, []);
        $mirrorNames = array_map(fn (array $p) => $p['name'], $mirrorPlayers);
        $mirrorPhotos = array_map(fn (array $p) => $p['avatar_url'], $mirrorPlayers);
        $mirrorStats = $this->inningsStats->compute($prefix, $mirrorNames);
        $stripMirror = $this->graphicOverBattersBowlerStrip(
            $prefix,
            $mirrorStats,
            $mirrorNames,
            [],
            (int) $first->batting_team_id,
            (int) $first->bowling_team_id,
            $mirrorPhotos,
        );

        return [
            'batting_team' => $battingTeamKey,
            'score' => "{$mirrorStats['total_runs']}-{$mirrorStats['total_wickets']}",
            'overs' => InningsStatsService::oversDisplay((int) $mirrorStats['legal_balls']),
            'batters' => $stripMirror['batters'],
            'bowler' => $stripMirror['bowler'],
            'current_over_deliveries' => $stripMirror['current_over_deliveries'],
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
        array $playerPhotos = [],
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
            $playerPhotos,
        );
        $currentOverDeliveries = $strip['current_over_deliveries'] ?? [];
        $currentOverBallModels = $strip['current_over_ball_models'];
        $batters = $strip['batters'];
        $previousOverRuns = $strip['previous_over_runs'];
        $previousOverWickets = $strip['previous_over_wickets'] ?? 0;

        // ── Fall of wickets in graphic format ─────────────────────────────────
        // Convert from shared {wicket_number, batsman_name, score, overs}
        // to graphic {number: ordinal, score: string}.

        $fowOrdinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        $fallOfWickets = array_map(fn ($fow, $i) => [
            'number' => $fowOrdinals[$i] ?? "{$fow['wicket_number']}th",
            'score' => (string) $fow['score'],
            'wicket_number' => (int) $fow['wicket_number'],
            'batsman_display_name' => trim((string) ($fow['batsman_name'] ?? '')),
            'overs_at_fall' => $fow['overs'] ?? '',
            'display' => "{$fow['wicket_number']}-{$fow['score']}",
        ], $stats['fall_of_wickets'], array_keys($stats['fall_of_wickets']));

        $extrasByBowler = $this->extrasConcededByBowler($balls);

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
        $partnershipHistory = $this->mapPartnershipHistory($partnerships, $playerNames, $playerPhotos);

        $extrasTotal = (int) ($stats['extras_breakdown']['total'] ?? 0);
        $foursTotal = 0;
        $sixesTotal = 0;
        foreach ($balls as $ball) {
            $rob = InningsStatsService::strikerRunsOffBat($ball);
            if ($rob === 4) {
                $foursTotal++;
            } elseif ($rob === 6) {
                $sixesTotal++;
            }
        }

        $maxWickets = max(0, (int) ($match->players_per_side ?? 11) - 1);
        $wicketsRemaining = max(0, $maxWickets - $totalWickets);

        $bowlers = array_map(function (array $row) use ($extrasByBowler) {
            $id = (int) $row['id'];

            return [
                'player_id' => $id,
                'display_name' => trim((string) ($row['name'] ?? '')),
                'overs_display' => $row['overs'],
                'runs_conceded' => (int) $row['runs'],
                'wickets' => (int) $row['wickets'],
                'dots' => (int) ($row['dots'] ?? 0),
                'extras_conceded' => $extrasByBowler[$id] ?? 0,
                'economy' => (float) str_replace(',', '', (string) $row['economy']),
                'figures_display' => BowlingFiguresFormatter::format((int) $row['wickets'], (int) $row['runs']),
            ];
        }, $stats['bowling']);

        $battingOrder = $this->mapBattingOrder($stats['batting'], $playerPhotos);
        $bowler = $strip['bowler'];
        if (! empty($bowler['user_id'])) {
            $bowler['extras_conceded'] = $extrasByBowler[(int) $bowler['user_id']] ?? 0;
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

        $currentOverDeliveries = $strip['current_over_deliveries'] ?? [];

        $projectedScore = $this->projectedScore(
            (int) $active->innings_number,
            $totalRuns,
            $legalBalls,
            $balls,
            (int) $match->overs,
        );

        return [
            'innings_number' => (int) $active->innings_number,
            'batting_team' => $battingTeamKey,
            'score' => "{$totalRuns}-{$totalWickets}",
            'wickets' => $totalWickets,
            'overs' => $oversDisplay,
            'extras' => $extrasTotal,
            'fours' => $foursTotal,
            'sixes' => $sixesTotal,
            'wickets_remaining' => $wicketsRemaining,
            'batters' => array_values($batters),
            'bowler' => $bowler,
            'bowlers' => $bowlers,
            'current_over_deliveries' => array_values($currentOverDeliveries),
            'partnership' => ['runs' => $partnershipRuns, 'balls' => $partnershipBalls],
            'partnership_history' => $partnershipHistory,
            'batting_order' => $battingOrder,
            'target' => $target,
            'runs_to_win' => $runsToWin,
            'balls_remaining' => $ballsRemaining,
            'current_rr' => $currentRR,
            'required_rr' => $requiredRR,
            'projected_score' => $projectedScore,
            'win_probability' => $winProbability,
            'fall_of_wickets' => $fallOfWickets,
            'previous_over' => ['runs' => $previousOverRuns, 'wickets' => $previousOverWickets],
            'last_12_balls' => $this->buildDeliveryWindow($balls, 12),
            'last_30_balls' => $this->computeBallStats($balls, 30),
            'this_over' => array_merge(
                $this->computeBallStats(collect($currentOverBallModels), null),
                ['deliveries' => $currentOverDeliveries],
            ),
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
            'wagon_wheel_balls' => ($match->wagon_wheel_enabled ?? false)
                ? $this->buildWagonWheelBalls($balls)
                : [],
        ];
    }

    /**
     * Shot-direction ball history for overlay wagon-wheel graphics.
     * Only legal batter scoring shots with a tagged shot_position are included.
     *
     * @param  Collection<int, Ball>  $balls
     * @return list<array{type: string, shot_direction: string, runs: int, striker_id: int|null}>
     */
    public function buildWagonWheelBalls(Collection $balls): array
    {
        $entries = [];

        foreach ($balls as $ball) {
            if ($ball->is_wide || $ball->is_no_ball || $ball->is_bye || $ball->is_leg_bye) {
                continue;
            }

            if ($ball->shot_position === null) {
                continue;
            }

            $runsOffBat = InningsStatsService::strikerRunsOffBat($ball);
            if ($runsOffBat <= 0) {
                continue;
            }

            $entries[] = [
                'type' => 'runs',
                'shot_direction' => $ball->shot_position->value,
                'runs' => $runsOffBat,
                'striker_id' => $ball->striker_id !== null ? (int) $ball->striker_id : null,
            ];
        }

        return $entries;
    }

    /**
     * First-innings projected total based on recent scoring (last 5 overs) and remaining overs.
     *
     * @param  Collection<int, Ball>  $balls
     */
    private function projectedScore(
        int $inningsNumber,
        int $totalRuns,
        int $legalBalls,
        Collection $balls,
        int $matchOvers,
    ): ?int {
        if ($inningsNumber !== 1) {
            return null;
        }

        $maxBalls = max(0, $matchOvers * 6);
        $ballsRemaining = max(0, $maxBalls - $legalBalls);
        if ($legalBalls <= 0 || $ballsRemaining <= 0) {
            return null;
        }

        $windowBalls = 30;
        $legal = $balls->filter(fn (Ball $b) => $b->isLegalDelivery())->values();
        $windowLegalCount = min($legalBalls, $windowBalls, $legal->count());
        $recentRuns = $this->computeBallStats($balls, $windowBalls)['runs'];

        if ($windowLegalCount >= 6) {
            $recentRunRate = $recentRuns / ($windowLegalCount / 6.0);
        } else {
            $recentRunRate = $totalRuns / ($legalBalls / 6.0);
        }

        $remainingOvers = $ballsRemaining / 6.0;

        return (int) round($totalRuns + ($recentRunRate * $remainingOvers));
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
     * Last N deliveries (legal and illegal) with per-ball chip metadata for Last 12 Balls LT.
     *
     * Includes wides, no-balls, etc. — same delivery set as the scorecard ball list and
     * {@see graphicOverBattersBowlerStrip()} current-over chips. Stats are computed on
     * the same window so runs total matches the chips shown.
     *
     * @param  Collection<int, Ball>  $allBalls
     * @return array{dots:int, fours:int, sixes:int, wickets:int, runs:int, deliveries:list<array<string, mixed>>}
     */
    private function buildDeliveryWindow(Collection $allBalls, int $count): array
    {
        $window = $allBalls->values()->slice(max(0, $allBalls->count() - $count));
        $deliveries = $window
            ->map(static fn (Ball $b): array => BallDeliveryPresenter::toDelivery($b))
            ->values()
            ->all();

        return array_merge($this->computeBallStats($window, null), ['deliveries' => $deliveries]);
    }

    /**
     * @param  list<array<string, mixed>>  $partnerships
     * @param  array<int, string>  $playerNames
     * @return list<array<string, mixed>>
     */
    private function mapPartnershipHistory(array $partnerships, array $playerNames, array $playerPhotos = []): array
    {
        return array_map(function (array $p) use ($playerNames, $playerPhotos) {
            $id1 = (int) $p['player_1_id'];
            $id2 = (int) $p['player_2_id'];
            $name1 = $playerNames[$id1] ?? '';
            $name2 = $playerNames[$id2] ?? '';

            return [
                'wicket_number' => $p['wicket_number'],
                'batter1_player_id' => $id1,
                'batter2_player_id' => $id2,
                'batter1_display_name' => trim($name1),
                'batter2_display_name' => trim($name2),
                'batter1_avatar_url' => $playerPhotos[$id1] ?? null,
                'batter2_avatar_url' => $playerPhotos[$id2] ?? null,
                'batter1_runs' => (int) $p['player_1_runs'],
                'batter2_runs' => (int) $p['player_2_runs'],
                'batter1_balls' => (int) $p['player_1_balls'],
                'batter2_balls' => (int) $p['player_2_balls'],
                'runs' => (int) $p['runs'],
                'balls' => (int) $p['balls'],
            ];
        }, $partnerships);
    }

    /**
     * @param  list<array<string, mixed>>  $batting
     * @param  array<int, string>  $playerPhotos
     * @return list<array<string, mixed>>
     */
    private function mapBattingOrder(array $batting, array $playerPhotos = []): array
    {
        return array_map(function (array $row) use ($playerPhotos) {
            $id = (int) $row['id'];
            $isDismissed = ! ($row['is_on_crease'] ?? false) && ($row['dismissal_type'] ?? null) !== null;
            $yetToBat = ($row['balls'] ?? 0) === 0 && ! ($row['is_on_crease'] ?? false) && ($row['dismissal_type'] ?? null) === null;

            $status = $yetToBat
                ? 'yet_to_bat'
                : ($isDismissed ? 'dismissed' : 'not_out');

            return [
                'player_id' => $id,
                'display_name' => trim((string) ($row['name'] ?? '')),
                'avatar_url' => $playerPhotos[$id] ?? null,
                'runs' => $status === 'yet_to_bat' ? null : (int) ($row['runs'] ?? 0),
                'balls' => $status === 'yet_to_bat' ? null : (int) ($row['balls'] ?? 0),
                'status' => $status,
                'is_at_crease' => (bool) ($row['is_on_crease'] ?? false),
                'dismissal_text' => $status === 'dismissed' ? ($row['dismissal_label'] ?? null) : null,
            ];
        }, $batting);
    }

    /**
     * Per-innings summaries for match summary graphics (all innings in the fixture).
     *
     * display_name carries the full player name; theme adapters apply LT/FS broadcast formatting.
     *
     * @param  Collection<int, Innings>  $innings
     * @return list<array<string, mixed>>
     */
    public function buildCompletedInningsSummaries(TournamentMatch $match, Collection $innings): array
    {
        $result = [];

        foreach ($innings as $inn) {
            $balls = $inn->balls;
            if ($balls->isEmpty()) {
                continue;
            }

            $names = InningsStatsService::namesFromDatabase($balls);
            $stats = $this->inningsStats->compute($balls, $names);
            $battingTeamKey = (int) $inn->batting_team_id === (int) $match->home_team_id ? 'home' : 'away';
            $team = $battingTeamKey === 'home' ? $match->homeTeam : $match->awayTeam;

            $fours = 0;
            $sixes = 0;
            foreach ($balls as $ball) {
                $rob = InningsStatsService::strikerRunsOffBat($ball);
                if ($rob === 4) {
                    $fours++;
                } elseif ($rob === 6) {
                    $sixes++;
                }
            }

            $battingRows = collect($stats['batting'] ?? [])
                ->sortByDesc(fn (array $row) => (int) ($row['runs'] ?? 0))
                ->take(3)
                ->map(fn (array $row) => [
                    'display_name' => trim((string) ($row['name'] ?? '')),
                    'runs' => (int) ($row['runs'] ?? 0),
                    'balls' => (int) ($row['balls'] ?? 0),
                    'is_not_out' => (bool) ($row['is_on_crease'] ?? false),
                ])
                ->values()
                ->all();

            $bowlingRows = collect($stats['bowling'] ?? [])
                ->sortByDesc(fn (array $row) => (int) ($row['wickets'] ?? 0))
                ->take(3)
                ->map(fn (array $row) => [
                    'display_name' => trim((string) ($row['name'] ?? '')),
                    'wickets' => (int) ($row['wickets'] ?? 0),
                    'runs_conceded' => (int) ($row['runs'] ?? 0),
                    'overs_display' => (string) ($row['overs'] ?? ''),
                ])
                ->values()
                ->all();

            $result[] = [
                'innings_number' => (int) $inn->innings_number,
                'batting_team' => $battingTeamKey,
                'batting_team_name' => $team?->name ?? '',
                'team' => [
                    'display_name' => $team?->name ?? '',
                    'short_code' => $team?->code ?? '',
                    'logo_url' => MediaDisk::url($team?->logo),
                ],
                'runs' => (int) $stats['total_runs'],
                'wickets' => (int) $stats['total_wickets'],
                'overs_display' => InningsStatsService::oversDisplay((int) $stats['legal_balls']),
                'extras' => (int) ($stats['extras_breakdown']['total'] ?? 0),
                'fours' => $fours,
                'sixes' => $sixes,
                'top_batters' => $battingRows,
                'top_bowlers' => $bowlingRows,
            ];
        }

        return $result;
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

            $teamModel = $battingTeamKey === 'home' ? $match->homeTeam : $match->awayTeam;
            $teamName = $teamModel?->name ?? ($battingTeamKey === 'home' ? 'Home' : 'Away');
            $teamLogoUrl = MediaDisk::url($teamModel?->logo);

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
            $wicketPoints = [];

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

                if ($ball->is_wicket && ! $ball->isRetiredHurt()) {
                    $wicketPoints[] = [
                        'over' => $this->oversToDecimal($validBalls),
                        'runs' => $totalRuns,
                    ];
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
            $cumulativePoints = array_map(static fn (array $row) => [
                'over' => (float) $row['over'],
                'runs' => (int) $row['cumulative'],
            ], $overs_breakdown);
            array_unshift($cumulativePoints, ['over' => 0.0, 'runs' => 0]);

            $maxOvers = max(1, (int) ($match->overs ?? 6));
            $phaseBuckets = $this->buildPhaseBuckets($overs_breakdown, $maxOvers);

            $result[] = [
                'innings_number' => (int) $inn->innings_number,
                'batting_team' => $battingTeamKey,
                'color_token' => $battingTeamKey,
                'team_name' => $teamName,
                'logo_url' => $teamLogoUrl,
                'overs_breakdown' => $overs_breakdown,
                'cumulative_points' => $cumulativePoints,
                'wicket_points' => $wicketPoints,
                'over_buckets' => $phaseBuckets,
                'phase_stats' => array_map(static fn (array $bucket) => [
                    'over_range' => $bucket['label'],
                    'runs' => $bucket['runs'],
                    'wickets_in_phase' => $bucket['wickets_in_phase'],
                ], $phaseBuckets),
                'total_runs' => $totalRuns,
                'total_wickets' => $totalWickets,
                'display_overs' => $displayOvers,
                'fours' => $fours,
                'sixes' => $sixes,
            ];
        }

        return $result;
    }

    private function oversToDecimal(int $legalBalls): float
    {
        return (float) (intdiv($legalBalls, 6) + ($legalBalls % 6) / 10);
    }

    /**
     * @param  list<array<string, mixed>>  $oversBreakdown
     * @return list<array{label: string, runs: int, run_rate: float, wickets_in_phase: int}>
     */
    private function buildPhaseBuckets(array $oversBreakdown, int $maxOvers): array
    {
        if ($oversBreakdown === []) {
            return [];
        }

        $splitAt = (int) ceil($maxOvers / 2);
        $phases = [
            ['label' => "1-{$splitAt}", 'from' => 1, 'to' => $splitAt],
            ['label' => ($splitAt + 1)."-{$maxOvers}", 'from' => $splitAt + 1, 'to' => $maxOvers],
        ];

        $buckets = [];
        foreach ($phases as $phase) {
            $runs = 0;
            $wickets = 0;
            $balls = 0;
            foreach ($oversBreakdown as $row) {
                $over = (int) ($row['over'] ?? 0);
                if ($over < $phase['from'] || $over > $phase['to']) {
                    continue;
                }
                $runs += (int) ($row['runs'] ?? 0);
                $wickets += (int) ($row['wickets'] ?? 0);
                $balls += (int) ($row['valid_balls'] ?? 0);
            }
            $buckets[] = [
                'label' => $phase['label'],
                'over_range' => $phase['label'],
                'runs' => $runs,
                'run_rate' => $balls > 0 ? round(($runs / $balls) * 6, 2) : 0.0,
                'wickets_in_phase' => $wickets,
            ];
        }

        return $buckets;
    }

    /**
     * Wides + no-ball penalties attributed to each bowler (for match report LT).
     *
     * @param  Collection<int, Ball>  $balls
     * @return array<int, int>
     */
    private function extrasConcededByBowler(Collection $balls): array
    {
        $map = [];
        foreach ($balls as $ball) {
            $bid = (int) ($ball->bowler_id ?? 0);
            if ($bid <= 0) {
                continue;
            }
            if ($ball->is_wide) {
                $map[$bid] = ($map[$bid] ?? 0) + max(1, (int) ($ball->runs ?? 0));
            } elseif ($ball->is_no_ball) {
                $map[$bid] = ($map[$bid] ?? 0) + max(1, (int) ($ball->runs ?? 1) - (int) ($ball->runs_off_bat ?? 0));
            }
        }

        return $map;
    }
}
