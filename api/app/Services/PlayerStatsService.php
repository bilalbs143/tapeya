<?php

namespace App\Services;

use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\PlayerBattingStats;
use App\Models\PlayerBowlingStats;
use App\Models\PlayerFieldingStats;
use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\PlayerMatchFielding;
use App\Models\TournamentMatch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Player stats: reads from materialized tables (Option B); falls back to computing from balls if empty.
 * Use compute* methods for jobs that refresh the tables.
 */
class PlayerStatsService
{
    // ─── Public static helpers ────────────────────────────────────────────────

    /**
     * Batting average = runs / dismissals, where dismissals = innings − not-outs.
     * When dismissals is 0 but innings > 0 (never dismissed in the sample), return total runs
     * so leaderboards and APIs do not expose null for an active batting line.
     */
    public static function battingAverage(int $runs, int $innings, int $notOuts): ?float
    {
        if ($innings <= 0) {
            return null;
        }

        $dismissals = $innings - max(0, $notOuts);
        if ($dismissals > 0) {
            return round($runs / $dismissals, 2);
        }

        return null;
    }

    // ─── Per-match: read materialized → fallback to compute ──────────────────

    /**
     * Per-match batting stats. Reads from player_match_batting; if empty, computes from balls.
     *
     * @return array<int, array{player_id: int, matches: int, innings: int, not_outs: int, runs: int, balls_faced: int, fours: int, sixes: int, dots: int, highest_score: string, hundreds: int, fifties: int, average: float|null, strike_rate: float|null}>
     */
    public function battingForMatch(int $matchId): array
    {
        $rows = PlayerMatchBatting::where('match_id', $matchId)->get();
        if ($rows->isNotEmpty()) {
            return $rows->map(fn ($row) => [
                'player_id' => $row->player_id,
                'matches' => $row->matches,
                'innings' => $row->innings,
                'not_outs' => $row->not_outs,
                'runs' => $row->runs,
                'balls_faced' => $row->balls_faced,
                'fours' => $row->fours,
                'sixes' => $row->sixes,
                'dots' => $row->dots,
                'highest_score' => $row->highest_score,
                'hundreds' => $row->hundreds,
                'fifties' => $row->fifties,
                'average' => self::battingAverage((int) $row->runs, (int) $row->innings, (int) $row->not_outs),
                'strike_rate' => $row->strike_rate,
            ])->values()->all();
        }

        return $this->computeBattingForMatch($matchId);
    }

    /**
     * Per-match bowling stats. Reads from player_match_bowling; if empty, computes from balls.
     *
     * @return array<int, array{player_id: int, matches: int, innings: int, overs: float, maidens: int, runs_conceded: int, wickets: int, no_balls: int, wides: int, best_bowling_innings: string, best_bowling_match: string, five_wickets: int, ten_wickets: int, average: float|null, economy: float|null, strike_rate: float|null}>
     */
    public function bowlingForMatch(int $matchId): array
    {
        $rows = PlayerMatchBowling::where('match_id', $matchId)->get();
        if ($rows->isNotEmpty()) {
            return $rows->map(fn ($row) => [
                'player_id' => $row->player_id,
                'matches' => $row->matches,
                'innings' => $row->innings,
                'overs' => $row->overs,
                'maidens' => $row->maidens,
                'runs_conceded' => $row->runs_conceded,
                'wickets' => $row->wickets,
                'no_balls' => $row->no_balls,
                'wides' => $row->wides,
                'best_bowling_innings' => $row->best_bowling_innings,
                'best_bowling_match' => $row->best_bowling_match,
                'five_wickets' => $row->five_wickets,
                'ten_wickets' => $row->ten_wickets,
                'average' => $row->average,
                'economy' => $row->economy,
                'strike_rate' => $row->strike_rate,
            ])->values()->all();
        }

        return $this->computeBowlingForMatch($matchId);
    }

    /**
     * Per-match fielding stats. Reads from player_match_fielding; if empty, computes from balls.
     *
     * @return array<int, array{player_id: int, matches: int, catches: int, run_outs: int, stumpings: int}>
     */
    public function fieldingForMatch(int $matchId): array
    {
        $rows = PlayerMatchFielding::where('match_id', $matchId)->get();
        if ($rows->isNotEmpty()) {
            return $rows->map(fn ($row) => [
                'player_id' => $row->player_id,
                'matches' => $row->matches,
                'catches' => $row->catches,
                'run_outs' => $row->run_outs,
                'stumpings' => $row->stumpings,
            ])->values()->all();
        }

        return $this->computeFieldingForMatch($matchId);
    }

    // ─── Compute from balls: per-match ───────────────────────────────────────

    /**
     * Compute per-match batting from balls (used by RefreshMatchStatsJob).
     *
     * @return array<int, array{player_id: int, matches: int, innings: int, not_outs: int, runs: int, balls_faced: int, fours: int, sixes: int, dots: int, highest_score: string, hundreds: int, fifties: int, average: float|null, strike_rate: float|null}>
     */
    public function computeBattingForMatch(int $matchId): array
    {
        $inningsIds = Innings::where('match_id', $matchId)->pluck('id');
        $balls = Ball::whereIn('innings_id', $inningsIds)->get();

        $byPlayer = [];
        $inningsOut = []; // player_id => set of innings_id where they were out

        foreach ($balls as $ball) {
            $pid = $ball->striker_id;
            $innId = $ball->innings_id;

            if (! isset($byPlayer[$pid])) {
                $byPlayer[$pid] = [
                    'runs' => 0,
                    'balls_faced' => 0,
                    'fours' => 0,
                    'sixes' => 0,
                    'dots' => 0,
                    'innings_runs' => [],
                ];
            }

            $byPlayer[$pid]['innings_runs'][$innId] = ($byPlayer[$pid]['innings_runs'][$innId] ?? 0) + $ball->runs_off_bat;
            $byPlayer[$pid]['runs'] += $ball->runs_off_bat;

            if (! $ball->is_wide) {
                $byPlayer[$pid]['balls_faced'] += 1;
                if ($ball->runs_off_bat === 0) {
                    $byPlayer[$pid]['dots'] += 1;
                }
            }
            if ($ball->runs_off_bat === 4) {
                $byPlayer[$pid]['fours'] += 1;
            }
            if ($ball->runs_off_bat === 6) {
                $byPlayer[$pid]['sixes'] += 1;
            }

            // retired_hurt is stored with is_wicket=true but must NOT count as
            // a dismissal — the batsman may return and their average is unaffected.
            if ($ball->is_wicket && $ball->out_player_id && ! $ball->isRetiredHurt()) {
                $op = $ball->out_player_id;
                $inningsOut[$op] = $inningsOut[$op] ?? [];
                $inningsOut[$op][$innId] = true;
            }
        }

        $result = [];
        foreach ($byPlayer as $playerId => $raw) {
            $innings = count($raw['innings_runs']);
            $playerOut = $inningsOut[$playerId] ?? [];
            $notOuts = $innings - count($playerOut);
            $highestScore = $this->highestScoreInnings($raw['innings_runs'], $playerOut);
            $runs = $raw['runs'];
            $ballsFaced = $raw['balls_faced'];
            $average = self::battingAverage($runs, $innings, $notOuts);
            $strikeRate = $ballsFaced > 0 ? round(100 * $runs / $ballsFaced, 2) : null;
            $hundreds = $this->countInningsWithRuns($raw['innings_runs'], 100);
            $fifties = $this->countInningsWithRunsRange($raw['innings_runs'], 50, 99);

            $result[] = [
                'player_id' => $playerId,
                'matches' => 1,
                'innings' => $innings,
                'not_outs' => max(0, $notOuts),
                'runs' => $runs,
                'balls_faced' => $ballsFaced,
                'fours' => $raw['fours'],
                'sixes' => $raw['sixes'],
                'dots' => $raw['dots'],
                'highest_score' => $highestScore,
                'hundreds' => $hundreds,
                'fifties' => $fifties,
                'average' => $average,
                'strike_rate' => $strikeRate,
            ];
        }

        return array_values($result);
    }

    /**
     * Compute per-match bowling from balls (used by RefreshMatchStatsJob).
     *
     * FIX (perf): track balls_bowled per player in the main loop instead of
     *             re-filtering the full collection once per player (was O(players×balls)).
     *
     * @return array<int, array{player_id: int, matches: int, innings: int, overs: float, maidens: int, runs_conceded: int, wickets: int, no_balls: int, wides: int, best_bowling_innings: string, best_bowling_match: string, five_wickets: int, ten_wickets: int, average: float|null, economy: float|null, strike_rate: float|null}>
     */
    public function computeBowlingForMatch(int $matchId): array
    {
        $inningsIds = Innings::where('match_id', $matchId)->pluck('id');
        $balls = Ball::whereIn('innings_id', $inningsIds)
            ->orderBy('innings_id')

            ->orderBy('over')->orderBy('ball_in_over')->orderBy('id')
            ->get();

        $byPlayer = [];
        foreach ($balls as $ball) {
            $pid = $ball->bowler_id;
            $innId = $ball->innings_id;

            if (! isset($byPlayer[$pid])) {
                $byPlayer[$pid] = [
                    'runs_conceded' => 0,
                    'wickets' => 0,
                    'no_balls' => 0,
                    'wides' => 0,
                    'balls_bowled' => 0,
                    'legal_balls' => 0, // legal deliveries (excl. wide/no-ball/extras-only) — used for overs, economy, SR
                    'overs_runs' => [],
                    'overs_balls' => [],
                    'innings_balls' => [], // innings_id => {wickets, runs} for best-bowling figures
                ];
            }

            $byPlayer[$pid]['runs_conceded'] += $ball->runs + $ball->penalty_runs;
            $byPlayer[$pid]['balls_bowled'] += 1;
            if ($ball->isLegalDelivery()) {
                $byPlayer[$pid]['legal_balls'] += 1;
            }

            // retired_hurt is stored with is_wicket=true but must NOT credit the
            // bowler with a wicket — the batsman was not dismissed by the bowler.
            $countsAsWicket = $ball->is_wicket && ! $ball->isRetiredHurt();
            if ($countsAsWicket) {
                $byPlayer[$pid]['wickets'] += 1;
            }
            if ($ball->is_no_ball) {
                $byPlayer[$pid]['no_balls'] += 1;
            }
            if ($ball->is_wide) {
                $byPlayer[$pid]['wides'] += 1;
            }

            $key = $innId.'_'.$ball->over;
            $byPlayer[$pid]['overs_runs'][$key] = ($byPlayer[$pid]['overs_runs'][$key] ?? 0) + $ball->runs + $ball->penalty_runs;
            $byPlayer[$pid]['overs_balls'][$key] = ($byPlayer[$pid]['overs_balls'][$key] ?? 0) + 1;

            // Accumulate per-innings data needed for bestBowlingInnings/Match
            $byPlayer[$pid]['innings_balls'][$innId] = $byPlayer[$pid]['innings_balls'][$innId] ?? ['wickets' => 0, 'runs' => 0];
            $byPlayer[$pid]['innings_balls'][$innId]['wickets'] += $countsAsWicket ? 1 : 0;
            $byPlayer[$pid]['innings_balls'][$innId]['runs'] += $ball->runs + $ball->penalty_runs;
        }

        $result = [];
        foreach ($byPlayer as $playerId => $raw) {
            $legalBalls = max(0, (int) $raw['legal_balls']);
            // Cricket-notation overs: 4.2 = 4 overs + 2 balls (not the float 4.33).
            // RefreshMatchStatsJob converts back via (wholeOvers * 6 + remainingBalls)
            // so the decimal part must represent balls 0–5, not a fraction of 6.
            $overs = intdiv($legalBalls, 6) + ($legalBalls % 6) * 0.1;

            $maidens = 0;
            foreach ($raw['overs_runs'] as $overKey => $runsInOver) {
                if ($runsInOver === 0 && ($raw['overs_balls'][$overKey] ?? 0) >= 6) {
                    $maidens++;
                }
            }

            $runsConceded = $raw['runs_conceded'];
            $wickets = $raw['wickets'];
            $inningsWicketsRuns = array_values($raw['innings_balls']);
            $bestBowlingInnings = $this->bestBowlingInnings($inningsWicketsRuns);
            // FIX: best_bowling_match = best single-match aggregate (for a per-match call
            //      there is only one match, so innings aggregate = match aggregate here).
            $bestBowlingMatch = $this->bestBowlingMatch($inningsWicketsRuns);
            $fiveWickets = count(array_filter($inningsWicketsRuns, fn ($i) => $i['wickets'] >= 5));
            $tenWickets = $wickets >= 10 ? 1 : 0;

            $innings = count(array_unique(
                array_map(fn ($k) => explode('_', $k)[0], array_keys($raw['overs_runs']))
            ));

            $result[] = [
                'player_id' => $playerId,
                'matches' => 1,
                'innings' => $innings,
                'overs' => $overs,
                'maidens' => $maidens,
                'runs_conceded' => $runsConceded,
                'wickets' => $wickets,
                'no_balls' => $raw['no_balls'],
                'wides' => $raw['wides'],
                'best_bowling_innings' => $bestBowlingInnings,
                'best_bowling_match' => $bestBowlingMatch,
                'five_wickets' => $fiveWickets,
                'ten_wickets' => $tenWickets,
                'average' => $wickets > 0 ? round($runsConceded / $wickets, 2) : null,
                'economy' => $legalBalls > 0 ? round($runsConceded / ($legalBalls / 6), 2) : null,
                'strike_rate' => ($wickets > 0 && $legalBalls > 0) ? round($legalBalls / $wickets, 2) : null,
            ];
        }

        return array_values($result);
    }

    /**
     * Compute per-match fielding from balls (used by RefreshMatchStatsJob).
     *
     * @return array<int, array{player_id: int, matches: int, catches: int, run_outs: int, stumpings: int}>
     */
    public function computeFieldingForMatch(int $matchId): array
    {
        $inningsIds = Innings::where('match_id', $matchId)->pluck('id');
        $balls = Ball::whereIn('innings_id', $inningsIds)
            ->where('is_wicket', true)
            ->whereNotNull('fielder_id')
            ->get();

        $byPlayer = [];
        foreach ($balls as $ball) {
            $fielderId = $ball->fielder_id;
            if (! $fielderId) {
                continue;
            }

            $dismissalType = $ball->dismissal_type?->value ?? '';
            if (! isset($byPlayer[$fielderId])) {
                $byPlayer[$fielderId] = ['catches' => 0, 'run_outs' => 0, 'stumpings' => 0];
            }

            if ($dismissalType === 'caught') {
                $byPlayer[$fielderId]['catches'] += 1;
            } elseif ($dismissalType === 'run_out') {
                $byPlayer[$fielderId]['run_outs'] += 1;
            } elseif ($dismissalType === 'stumped') {
                $byPlayer[$fielderId]['stumpings'] += 1;
            }
        }

        $result = [];
        foreach ($byPlayer as $playerId => $raw) {
            $result[] = [
                'player_id' => $playerId,
                'matches' => 1,
                'catches' => $raw['catches'],
                'run_outs' => $raw['run_outs'],
                'stumpings' => $raw['stumpings'],
            ];
        }

        return array_values($result);
    }

    // ─── Partnerships ─────────────────────────────────────────────────────────

    /**
     * Partnership stats for one innings: runs and balls for each batting pair (stand),
     * including per-player contributions (player_1_runs, player_1_balls, etc.).
     *
     * player_1_id / player_2_id are ordered by ascending ID (consistent ordering).
     * player_1_runs / player_1_balls track the runs scored and legal deliveries faced
     * by that specific player during the stand.
     *
     * Rules:
     *  - Partnership runs = runs_off_bat + non-penalty extras (byes, leg-byes).
     *    Penalty runs belong to the team, not the stand.
     *  - Per-player runs  = runs_off_bat for the striker only (extras are not credited
     *    to either batter personally).
     *  - Per-player balls = legal deliveries faced (wides excluded; no-balls count).
     *
     * @return array<int, array{
     *   player_1_id: int, player_1_runs: int, player_1_balls: int,
     *   player_2_id: int, player_2_runs: int, player_2_balls: int,
     *   runs: int, balls: int, wicket_number: int|null
     * }>
     */
    public function partnershipsForInnings(int $inningsId, ?Collection $balls = null): array
    {
        $balls ??= Ball::where('innings_id', $inningsId)
            ->orderBy('over')->orderBy('ball_in_over')->orderBy('id')
            ->get();

        $partnerships = [];
        $currentStriker = null;
        $currentNonStriker = null;
        $runs = 0;
        $ballsCount = 0;
        // Per-player stats keyed by player_id
        $playerRuns = [];
        $playerBalls = [];
        $wicketNumber = 1;

        foreach ($balls as $ball) {
            $striker = $ball->striker_id;
            $nonStriker = $ball->non_striker_id;

            if ($currentStriker === null) {
                $currentStriker = $striker;
                $currentNonStriker = $nonStriker;
                $playerRuns[$striker] = 0;
                $playerRuns[$nonStriker] = 0;
                $playerBalls[$striker] = 0;
                $playerBalls[$nonStriker] = 0;
            }

            // Partnership total: runs_off_bat + non-penalty extras (byes, leg-byes).
            // Penalty runs belong to the team, not the stand.
            $runs += $ball->runs;
            $ballsCount += 1;

            // Per-player: only the striker earns runs_off_bat.
            // Wides don't count as a ball faced; no-balls do.
            if (! isset($playerRuns[$striker])) {
                $playerRuns[$striker] = 0;
                $playerBalls[$striker] = 0;
            }
            $playerRuns[$striker] += $ball->runs_off_bat ?? 0;
            if (! $ball->is_wide) {
                $playerBalls[$striker] = ($playerBalls[$striker] ?? 0) + 1;
            }

            if ($ball->is_wicket && $ball->out_player_id) {
                $p1 = min($currentStriker, $currentNonStriker);
                $p2 = max($currentStriker, $currentNonStriker);
                $partnerships[] = [
                    'player_1_id' => $p1,
                    'player_1_runs' => $playerRuns[$p1] ?? 0,
                    'player_1_balls' => $playerBalls[$p1] ?? 0,
                    'player_2_id' => $p2,
                    'player_2_runs' => $playerRuns[$p2] ?? 0,
                    'player_2_balls' => $playerBalls[$p2] ?? 0,
                    'runs' => $runs,
                    'balls' => $ballsCount,
                    'wicket_number' => $wicketNumber,
                ];
                $wicketNumber++;
                $runs = 0;
                $ballsCount = 0;
                $playerRuns = [];
                $playerBalls = [];
                $currentStriker = null;
                $currentNonStriker = null;
            }
        }

        // Unfinished / current partnership (not-out stand)
        if ($currentStriker !== null && ($runs > 0 || $ballsCount > 0)) {
            $p1 = min($currentStriker, $currentNonStriker ?? $currentStriker);
            $p2 = max($currentStriker, $currentNonStriker ?? $currentStriker);
            $partnerships[] = [
                'player_1_id' => $p1,
                'player_1_runs' => $playerRuns[$p1] ?? 0,
                'player_1_balls' => $playerBalls[$p1] ?? 0,
                'player_2_id' => $p2,
                'player_2_runs' => $playerRuns[$p2] ?? 0,
                'player_2_balls' => $playerBalls[$p2] ?? 0,
                'runs' => $runs,
                'balls' => $ballsCount,
                'wicket_number' => null,
            ];
        }

        return $partnerships;
    }

    /**
     * Partnership stats for a match (all innings).
     *
     * @return array<int, array{innings_id: int, innings_number: int, partnerships: array}>
     */
    public function partnershipsForMatch(int $matchId): array
    {
        $innings = Innings::where('match_id', $matchId)->orderBy('innings_number')->get();
        $result = [];
        foreach ($innings as $inn) {
            $result[] = [
                'innings_id' => $inn->id,
                'innings_number' => $inn->innings_number,
                'partnerships' => $this->partnershipsForInnings($inn->id),
            ];
        }

        return $result;
    }

    // ─── Accumulative: per-player ─────────────────────────────────────────────

    /**
     * Accumulative batting stats for a player. Reads from player_batting_stats when
     * tournament_type is set; else computes (e.g. for 'all').
     *
     * @param  TournamentTypeEnum|'all'|null  $eventType  null or 'all' = compute from balls
     * @return array{matches: int, innings: int, not_outs: int, runs: int, balls_faced: int, fours: int, sixes: int, dots: int, highest_score: string, hundreds: int, fifties: int, average: float|null, strike_rate: float|null}
     */
    public function battingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $eventTypeValue = $this->normalizeEventType($eventType);
        if ($eventTypeValue !== null) {
            $row = PlayerBattingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventTypeValue)
                ->first();
            if ($row) {
                return [
                    'matches' => $row->matches,
                    'innings' => $row->innings,
                    'not_outs' => $row->not_outs,
                    'runs' => $row->runs,
                    'balls_faced' => $row->balls_faced,
                    'fours' => $row->fours,
                    'sixes' => $row->sixes,
                    'dots' => $row->dots,
                    'highest_score' => $row->highest_score,
                    'hundreds' => $row->hundreds,
                    'fifties' => $row->fifties,
                    'average' => self::battingAverage((int) $row->runs, (int) $row->innings, (int) $row->not_outs),
                    'strike_rate' => $row->strike_rate,
                ];
            }
        }

        return $this->computeBattingForPlayer($playerId, $eventType);
    }

    /**
     * Accumulative bowling stats for a player. Reads from player_bowling_stats when
     * tournament_type is set; else computes.
     *
     * @param  TournamentTypeEnum|'all'|null  $eventType
     * @return array{matches: int, innings: int, overs: float, maidens: int, runs_conceded: int, wickets: int, no_balls: int, wides: int, best_bowling_innings: string, best_bowling_match: string, five_wickets: int, ten_wickets: int, average: float|null, economy: float|null, strike_rate: float|null}
     */
    public function bowlingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $eventTypeValue = $this->normalizeEventType($eventType);
        if ($eventTypeValue !== null) {
            $row = PlayerBowlingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventTypeValue)
                ->first();
            if ($row) {
                return [
                    'matches' => $row->matches,
                    'innings' => $row->innings,
                    'overs' => $row->overs,
                    'maidens' => $row->maidens,
                    'runs_conceded' => $row->runs_conceded,
                    'wickets' => $row->wickets,
                    'no_balls' => $row->no_balls,
                    'wides' => $row->wides,
                    'best_bowling_innings' => $row->best_bowling_innings,
                    'best_bowling_match' => $row->best_bowling_match,
                    'five_wickets' => $row->five_wickets,
                    'ten_wickets' => $row->ten_wickets,
                    'average' => $row->average,
                    'economy' => $row->economy,
                    'strike_rate' => $row->strike_rate,
                ];
            }
        }

        return $this->computeBowlingForPlayer($playerId, $eventType);
    }

    /**
     * Accumulative fielding stats for a player. Reads from player_fielding_stats when
     * tournament_type is set; else computes.
     *
     * @param  TournamentTypeEnum|'all'|null  $eventType
     * @return array{matches: int, catches: int, run_outs: int, stumpings: int}
     */
    public function fieldingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $eventTypeValue = $this->normalizeEventType($eventType);
        if ($eventTypeValue !== null) {
            $row = PlayerFieldingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventTypeValue)
                ->first();
            if ($row) {
                return [
                    'matches' => $row->matches,
                    'catches' => $row->catches,
                    'run_outs' => $row->run_outs,
                    'stumpings' => $row->stumpings,
                ];
            }
        }

        return $this->computeFieldingForPlayer($playerId, $eventType);
    }

    // ─── Rankings ─────────────────────────────────────────────────────────────

    /**
     * Rankings: list players with accumulative stats for an event type, sorted by a metric.
     *
     * FIX (perf): bulk-fetch all rows from the materialized stats table in one query,
     *             falling back to compute only for players without a materialized row.
     *             Previously called battingForPlayer/bowlingForPlayer/fieldingForPlayer
     *             per player — one query each — producing an N+1 pattern.
     *
     * FIX (arch): use TournamentTypeEnum::from() so unknown event type strings throw a
     *             ValueError instead of silently defaulting to EMERGING.
     *
     * @param  'batting'|'bowling'|'fielding'  $category
     * @param  string  $sort  e.g. runs, average, strike_rate, wickets, economy, catches
     * @param  int  $minInnings  minimum innings (batting) or matches (bowling) to qualify
     * @return array<int, array{player_id: int, stats: array}>
     */
    public function rankings(string $eventType, string $category, string $sort = 'runs', int $minInnings = 0): array
    {
        // FIX: TournamentTypeEnum::from() throws ValueError on unknown values — safe & extensible.
        $et = TournamentTypeEnum::from($eventType);
        $etValue = $et->value;
        $playerIds = $this->playerIdsWithActivity($et, $category);

        // Bulk-fetch materialized rows for all active players in one query.
        $materialized = match ($category) {
            'batting' => PlayerBattingStats::where('tournament_type', $etValue)
                ->whereIn('player_id', $playerIds)
                ->get()
                ->keyBy('player_id'),
            'bowling' => PlayerBowlingStats::where('tournament_type', $etValue)
                ->whereIn('player_id', $playerIds)
                ->get()
                ->keyBy('player_id'),
            default => PlayerFieldingStats::where('tournament_type', $etValue)
                ->whereIn('player_id', $playerIds)
                ->get()
                ->keyBy('player_id'),
        };

        $out = [];
        foreach ($playerIds as $pid) {
            // Resolve from materialized cache; compute only on a cache miss.
            if ($category === 'batting') {
                $row = $materialized->get($pid);
                $s = $row
                    ? [
                        'matches' => $row->matches,
                        'innings' => $row->innings,
                        'not_outs' => $row->not_outs,
                        'runs' => $row->runs,
                        'balls_faced' => $row->balls_faced,
                        'fours' => $row->fours,
                        'sixes' => $row->sixes,
                        'dots' => $row->dots,
                        'highest_score' => $row->highest_score,
                        'hundreds' => $row->hundreds,
                        'fifties' => $row->fifties,
                        'average' => self::battingAverage((int) $row->runs, (int) $row->innings, (int) $row->not_outs),
                        'strike_rate' => $row->strike_rate,
                    ]
                    : $this->computeBattingForPlayer($pid, $et);

                if ($minInnings > 0 && $s['innings'] < $minInnings) {
                    continue;
                }
            } elseif ($category === 'bowling') {
                $row = $materialized->get($pid);
                $s = $row
                    ? [
                        'matches' => $row->matches,
                        'innings' => $row->innings,
                        'overs' => $row->overs,
                        'maidens' => $row->maidens,
                        'runs_conceded' => $row->runs_conceded,
                        'wickets' => $row->wickets,
                        'no_balls' => $row->no_balls,
                        'wides' => $row->wides,
                        'best_bowling_innings' => $row->best_bowling_innings,
                        'best_bowling_match' => $row->best_bowling_match,
                        'five_wickets' => $row->five_wickets,
                        'ten_wickets' => $row->ten_wickets,
                        'average' => $row->average,
                        'economy' => $row->economy,
                        'strike_rate' => $row->strike_rate,
                    ]
                    : $this->computeBowlingForPlayer($pid, $et);

                if ($minInnings > 0 && $s['matches'] < $minInnings) {
                    continue;
                }
            } else {
                $row = $materialized->get($pid);
                $s = $row
                    ? [
                        'matches' => $row->matches,
                        'catches' => $row->catches,
                        'run_outs' => $row->run_outs,
                        'stumpings' => $row->stumpings,
                    ]
                    : $this->computeFieldingForPlayer($pid, $et);
            }

            $out[] = ['player_id' => $pid, 'stats' => $s];
        }

        return array_values($this->sortRankings($out, $category, $sort));
    }

    /**
     * 1-based position in the leaderboard for this player, or null if not ranked.
     */
    public function rankPositionForPlayer(int $playerId, string $eventType, string $category, string $sort = 'runs', int $minInnings = 0): ?int
    {
        $rankings = $this->rankings($eventType, $category, $sort, $minInnings);
        foreach ($rankings as $index => $row) {
            if ((int) $row['player_id'] === $playerId) {
                return $index + 1;
            }
        }

        return null;
    }

    // ─── Private: compute accumulative per-player ─────────────────────────────

    private function computeBattingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $matchIds = $this->matchIdsForEventType($eventType);
        $inningsIds = Innings::whereIn('match_id', $matchIds)->pluck('id');

        $ballsStriker = Ball::whereIn('innings_id', $inningsIds)->where('striker_id', $playerId)->get();
        // Exclude retired_hurt: it is stored with is_wicket=true but the batsman
        // is not dismissed, so the innings must not count as a "not out lost".
        $inningsOutIds = Ball::whereIn('innings_id', $inningsIds)
            ->where('is_wicket', true)
            ->where('out_player_id', $playerId)
            ->where('dismissal_type', '!=', 'retired_hurt')
            ->pluck('innings_id')
            ->unique()
            ->all();

        $inningsRuns = [];
        foreach ($ballsStriker as $ball) {
            $innId = $ball->innings_id;
            $inningsRuns[$innId] = ($inningsRuns[$innId] ?? 0) + $ball->runs_off_bat;
        }

        $inningsOut = array_fill_keys($inningsOutIds, true);
        $innings = count(array_unique(array_merge(array_keys($inningsRuns), $inningsOutIds)));

        // FIX: empty-return now includes 'dots' so every code path returns the same shape.
        if ($innings === 0) {
            return [
                'matches' => 0,
                'innings' => 0,
                'not_outs' => 0,
                'runs' => 0,
                'balls_faced' => 0,
                'fours' => 0,
                'sixes' => 0,
                'dots' => 0,
                'highest_score' => '0',
                'hundreds' => 0,
                'fifties' => 0,
                'average' => null,
                'strike_rate' => null,
            ];
        }

        $notOuts = $innings - count($inningsOutIds);
        $runs = array_sum($inningsRuns);
        $ballsFaced = $ballsStriker->filter(fn ($b) => ! $b->is_wide)->count();
        $dots = $ballsStriker->filter(fn ($b) => ! $b->is_wide && $b->runs_off_bat === 0)->count();
        $fours = $ballsStriker->where('runs_off_bat', 4)->count();
        $sixes = $ballsStriker->where('runs_off_bat', 6)->count();
        $highestScore = $this->highestScoreInnings($inningsRuns, $inningsOut);
        $hundreds = $this->countInningsWithRuns($inningsRuns, 100);
        $fifties = $this->countInningsWithRunsRange($inningsRuns, 50, 99);
        $average = self::battingAverage($runs, $innings, $notOuts);
        $strikeRate = $ballsFaced > 0 ? round(100 * $runs / $ballsFaced, 2) : null;
        $matches = $this->matchCountForPlayerBatting($playerId, $eventType);

        return [
            'matches' => $matches,
            'innings' => $innings,
            'not_outs' => max(0, $notOuts),
            'runs' => $runs,
            'balls_faced' => $ballsFaced,
            'fours' => $fours,
            'sixes' => $sixes,
            'dots' => $dots,
            'highest_score' => $highestScore,
            'hundreds' => $hundreds,
            'fifties' => $fifties,
            'average' => $average,
            'strike_rate' => $strikeRate,
        ];
    }

    private function computeBowlingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $base = Ball::query()
            ->where('bowler_id', $playerId)
            ->join('innings', 'balls.innings_id', '=', 'innings.id')
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id');

        $this->applyEventTypeFilter($base, $eventType);

        $balls = $base->select('balls.*')->get();
        $runsConceded = $balls->sum(fn ($b) => $b->runs + $b->penalty_runs);
        // Exclude retired_hurt: the bowler does not receive wicket credit.
        $wickets = $balls->filter(fn ($b) => $b->is_wicket && ! $b->isRetiredHurt())->count();
        $noBalls = $balls->where('is_no_ball', true)->count();
        $wides = $balls->where('is_wide', true)->count();
        $ballsBowled = $balls->count();
        $overs = round($ballsBowled / 6, 2);

        // FIX: track legal ball count per over to correctly detect maiden overs.
        // A maiden requires exactly 6 (or more, for no-balls) legal deliveries with 0 runs.
        $oversRuns = [];
        $oversBalls = []; // legal balls per over key
        foreach ($balls as $b) {
            $k = $b->innings_id.'_'.$b->over;
            $oversRuns[$k] = ($oversRuns[$k] ?? 0) + $b->runs + $b->penalty_runs;
            if ($b->isLegalDelivery()) {
                $oversBalls[$k] = ($oversBalls[$k] ?? 0) + 1;
            }
        }
        $maidens = count(array_filter(
            $oversRuns,
            fn ($v, $k) => $v === 0 && ($oversBalls[$k] ?? 0) >= 6,
            ARRAY_FILTER_USE_BOTH
        ));

        $inningsWicketsRuns = $this->bowlingInningsWicketsRuns($balls);
        $bestBowlingInnings = $this->bestBowlingInnings($inningsWicketsRuns);
        // FIX: best_bowling_match aggregates across all innings in each match, then picks best.
        $bestBowlingMatch = $this->bestBowlingMatchForPlayer($playerId, $eventType);
        $fiveWickets = count(array_filter($inningsWicketsRuns, fn ($i) => $i['wickets'] >= 5));
        $matches = $this->matchCountForPlayerBowling($playerId, $eventType);
        $tenWickets = $this->matchCountWithTenWickets($playerId, $eventType);

        return [
            'matches' => $matches,
            'innings' => count($inningsWicketsRuns),
            'overs' => $overs,
            'maidens' => $maidens,
            'runs_conceded' => $runsConceded,
            'wickets' => $wickets,
            'no_balls' => $noBalls,
            'wides' => $wides,
            'best_bowling_innings' => $bestBowlingInnings,
            'best_bowling_match' => $bestBowlingMatch,
            'five_wickets' => $fiveWickets,
            'ten_wickets' => $tenWickets,
            'average' => $wickets > 0 ? round($runsConceded / $wickets, 2) : null,
            'economy' => $overs > 0 ? round($runsConceded / $overs, 2) : null,
            'strike_rate' => $wickets > 0 ? round($ballsBowled / $wickets, 2) : null,
        ];
    }

    private function computeFieldingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $query = Ball::query()
            ->where('is_wicket', true)
            ->where('fielder_id', $playerId)
            ->join('innings', 'balls.innings_id', '=', 'innings.id')
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->select('balls.*', 'innings.match_id');

        $this->applyEventTypeFilter($query, $eventType);

        $balls = $query->get();
        $catches = $balls->filter(fn ($b) => $b->dismissal_type?->value === 'caught')->count();
        $runOuts = $balls->filter(fn ($b) => $b->dismissal_type?->value === 'run_out')->count();
        $stumpings = $balls->filter(fn ($b) => $b->dismissal_type?->value === 'stumped')->count();

        // FIX: count distinct match_ids, not innings_ids.
        // A player who took catches in both innings of a match was previously counted as 2 matches.
        $matches = $balls->pluck('match_id')->unique()->count();

        return [
            'matches' => $matches,
            'catches' => $catches,
            'run_outs' => $runOuts,
            'stumpings' => $stumpings,
        ];
    }

    // ─── Private: query helpers ───────────────────────────────────────────────

    /**
     * FIX (arch): single helper replacing 5 copies of the same if/elseif eventType filter block.
     */
    private function applyEventTypeFilter(Builder $query, TournamentTypeEnum|string|null $eventType): void
    {
        $val = $this->normalizeEventType($eventType);
        if ($val !== null) {
            $query->where('tournaments.tournament_type', $val);
        }
    }

    /** @return string|null tournament_type string, or null for 'all' / null */
    private function normalizeEventType(TournamentTypeEnum|string|null $eventType): ?string
    {
        if ($eventType === null || $eventType === 'all') {
            return null;
        }

        return $eventType instanceof TournamentTypeEnum ? $eventType->value : (string) $eventType;
    }

    private function matchIdsForEventType(TournamentTypeEnum|string|null $eventType): array
    {
        $q = TournamentMatch::query()->select('id');
        if ($eventType && $eventType !== 'all') {
            $val = $eventType instanceof TournamentTypeEnum ? $eventType->value : $eventType;
            $q->whereHas('tournament', fn ($q) => $q->where('tournament_type', $val));
        }

        return $q->pluck('id')->all();
    }

    private function matchCountForPlayerBatting(int $playerId, TournamentTypeEnum|string|null $eventType): int
    {
        $q = TournamentMatch::query()
            ->join('innings', 'matches.id', '=', 'innings.match_id')
            ->join('balls', 'innings.id', '=', 'balls.innings_id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->where('balls.striker_id', $playerId)
            ->distinct('matches.id');

        $this->applyEventTypeFilter($q, $eventType);

        return $q->count('matches.id');
    }

    private function matchCountForPlayerBowling(int $playerId, TournamentTypeEnum|string|null $eventType): int
    {
        $q = TournamentMatch::query()
            ->join('innings', 'matches.id', '=', 'innings.match_id')
            ->join('balls', 'innings.id', '=', 'balls.innings_id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->where('balls.bowler_id', $playerId)
            ->distinct('matches.id');

        $this->applyEventTypeFilter($q, $eventType);

        return $q->count('matches.id');
    }

    /**
     * FIX (perf): replaced N individual Ball::count() calls (one per match) with a single
     * grouped query that returns wicket totals per match in one round-trip.
     */
    private function matchCountWithTenWickets(int $playerId, TournamentTypeEnum|string|null $eventType): int
    {
        $inningsQuery = Innings::query()
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->select('innings.id', 'innings.match_id');

        $this->applyEventTypeFilter($inningsQuery, $eventType);

        $inningsByMatch = $inningsQuery->get()->groupBy('match_id');

        if ($inningsByMatch->isEmpty()) {
            return 0;
        }

        // One grouped query: wickets per innings_id for this bowler.
        $allInningsIds = $inningsByMatch->flatten()->pluck('id');
        $wicketsPerInnings = Ball::whereIn('innings_id', $allInningsIds)
            ->where('bowler_id', $playerId)
            ->where('is_wicket', true)
            ->where('dismissal_type', '!=', 'retired_hurt')
            ->selectRaw('innings_id, COUNT(*) as wkts')
            ->groupBy('innings_id')
            ->pluck('wkts', 'innings_id');

        $count = 0;
        foreach ($inningsByMatch as $matchId => $inningsList) {
            $matchWickets = $inningsList->sum(fn ($inn) => $wicketsPerInnings->get($inn->id, 0));
            if ($matchWickets >= 10) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Best bowling figures in a single match (sum wickets + runs across all innings of that match).
     * Used by computeBowlingForMatch where all innings_balls belong to one match.
     *
     * @param  array<int, array{wickets: int, runs: int}>  $inningsWicketsRuns
     */
    private function bestBowlingMatch(array $inningsWicketsRuns): string
    {
        if (empty($inningsWicketsRuns)) {
            return '0/0';
        }
        $totalWickets = array_sum(array_column($inningsWicketsRuns, 'wickets'));
        $totalRuns = array_sum(array_column($inningsWicketsRuns, 'runs'));

        return $totalWickets.'/'.$totalRuns;
    }

    /**
     * Best bowling match figures across all matches for a player.
     * Aggregates wickets + runs per match, then picks the best.
     */
    private function bestBowlingMatchForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): string
    {
        $inningsQuery = Innings::query()
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->select('innings.id', 'innings.match_id');

        $this->applyEventTypeFilter($inningsQuery, $eventType);

        $inningsByMatch = $inningsQuery->get()->groupBy('match_id');

        if ($inningsByMatch->isEmpty()) {
            return '0/0';
        }

        $allInningsIds = $inningsByMatch->flatten()->pluck('id');
        $statsByInnings = Ball::whereIn('innings_id', $allInningsIds)
            ->where('bowler_id', $playerId)
            ->selectRaw('innings_id, SUM(is_wicket::int) as wickets, SUM(runs + penalty_runs) as runs')
            ->groupBy('innings_id')
            ->get()
            ->keyBy('innings_id');

        $bestWickets = 0;
        $bestRuns = PHP_INT_MAX;

        foreach ($inningsByMatch as $matchId => $inningsList) {
            $matchWickets = 0;
            $matchRuns = 0;
            foreach ($inningsList as $inn) {
                $stat = $statsByInnings->get($inn->id);
                if ($stat) {
                    $matchWickets += (int) $stat->wickets;
                    $matchRuns += (int) $stat->runs;
                }
            }
            if ($matchWickets > $bestWickets || ($matchWickets === $bestWickets && $matchRuns < $bestRuns)) {
                $bestWickets = $matchWickets;
                $bestRuns = $matchRuns;
            }
        }

        return $bestWickets.'/'.($bestRuns === PHP_INT_MAX ? 0 : $bestRuns);
    }

    private function playerIdsWithActivity(TournamentTypeEnum $eventType, string $category): array
    {
        $base = fn () => Ball::query()
            ->join('innings', 'balls.innings_id', '=', 'innings.id')
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->where('tournaments.tournament_type', $eventType->value);

        if ($category === 'batting') {
            return $base()->distinct()->pluck('balls.striker_id')->filter()->values()->all();
        }

        if ($category === 'bowling') {
            return $base()->distinct()->pluck('balls.bowler_id')->filter()->values()->all();
        }

        // fielding
        return $base()
            ->where('balls.is_wicket', true)
            ->whereNotNull('balls.fielder_id')
            ->distinct()
            ->pluck('balls.fielder_id')
            ->filter()
            ->values()
            ->all();
    }

    // ─── Private: stat calculation helpers ───────────────────────────────────

    private function highestScoreInnings(array $inningsRuns, array $inningsOut): string
    {
        if (empty($inningsRuns)) {
            return '0';
        }
        $max = max($inningsRuns);
        $notOut = false;
        foreach ($inningsRuns as $innId => $runsInInnings) {
            if ($runsInInnings === $max && ! isset($inningsOut[$innId])) {
                $notOut = true;
                break;
            }
        }

        return $max.($notOut ? '*' : '');
    }

    private function countInningsWithRuns(array $inningsRuns, int $min): int
    {
        return count(array_filter($inningsRuns, fn ($runs) => $runs >= $min));
    }

    private function countInningsWithRunsRange(array $inningsRuns, int $min, int $max): int
    {
        return count(array_filter($inningsRuns, fn ($runs) => $runs >= $min && $runs <= $max));
    }

    private function bowlingInningsWicketsRuns(Collection $balls): array
    {
        $byInn = [];
        foreach ($balls as $ball) {
            $inningsId = $ball->innings_id;
            if (! isset($byInn[$inningsId])) {
                $byInn[$inningsId] = ['wickets' => 0, 'runs' => 0];
            }
            // retired_hurt must not credit the bowler with a wicket.
            $byInn[$inningsId]['wickets'] += ($ball->is_wicket && ! $ball->isRetiredHurt()) ? 1 : 0;
            $byInn[$inningsId]['runs'] += $ball->runs + $ball->penalty_runs;
        }

        return array_values($byInn);
    }

    private function bestBowlingInnings(array $inningsWicketsRuns): string
    {
        if (empty($inningsWicketsRuns)) {
            return '0/0';
        }
        usort($inningsWicketsRuns, fn ($a, $b) => $b['wickets'] <=> $a['wickets'] ?: $a['runs'] <=> $b['runs']);
        $best = $inningsWicketsRuns[0];

        return $best['wickets'].'/'.$best['runs'];
    }

    /**
     * FIX (arch): sortRankings now handles five_wickets and ten_wickets explicitly.
     * Previously they appeared in the $desc list but fell through to the default 'runs' key,
     * making the sort silently incorrect for those fields.
     */
    private function sortRankings(array $out, string $category, string $sort): array
    {
        // Descending sorts: higher = better.
        $desc = in_array($sort, [
            'runs', 'balls_faced', 'wickets', 'hundreds', 'fifties',
            'five_wickets', 'ten_wickets', 'catches', 'run_outs', 'stumpings',
        ], true);

        // FIX: five_wickets and ten_wickets now map to their real keys.
        $key = match ($sort) {
            'runs' => 'runs',
            'average' => 'average',
            'strike_rate' => 'strike_rate',
            'balls_faced' => 'balls_faced',
            'hundreds' => 'hundreds',
            'fifties' => 'fifties',
            'wickets' => 'wickets',
            'five_wickets' => 'five_wickets',
            'ten_wickets' => 'ten_wickets',
            'economy' => 'economy',
            'catches' => 'catches',
            'run_outs' => 'run_outs',
            'stumpings' => 'stumpings',
            default => 'runs',
        };

        usort($out, function ($a, $b) use ($key, $desc) {
            $sa = $a['stats'][$key] ?? null;
            $sb = $b['stats'][$key] ?? null;

            // Nulls always sort last regardless of direction.
            if ($sa === null && $sb === null) {
                return 0;
            }
            if ($sa === null) {
                return 1;
            }
            if ($sb === null) {
                return -1;
            }

            return $desc ? $sb <=> $sa : $sa <=> $sb;
        });

        return $out;
    }
}
