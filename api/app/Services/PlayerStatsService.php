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
use Illuminate\Support\Collection;

/**
 * Player stats: reads from materialized tables (Option B); falls back to computing from balls if empty.
 * Use compute* methods for jobs that refresh the tables.
 */
class PlayerStatsService
{
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
                'average' => $row->average,
                'strike_rate' => $row->strike_rate,
            ])->values()->all();
        }

        return $this->computeBattingForMatch($matchId);
    }

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
        $inningsBatted = []; // player_id => set of innings_id
        $inningsOut = [];    // player_id => set of innings_id where they were out

        foreach ($balls as $ball) {
            $pid = $ball->striker_id;
            $innId = $ball->innings_id;

            if (! isset($byPlayer[$pid])) {
                $byPlayer[$pid] = ['runs' => 0, 'balls_faced' => 0, 'fours' => 0, 'sixes' => 0, 'dots' => 0, 'innings_runs' => []];
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

            $inningsBatted[$pid] = $inningsBatted[$pid] ?? [];
            $inningsBatted[$pid][$innId] = true;

            if ($ball->is_wicket && $ball->out_player_id) {
                $op = $ball->out_player_id;
                $inningsOut[$op] = $inningsOut[$op] ?? [];
                $inningsOut[$op][$innId] = true;
            }
        }

        $result = [];
        foreach ($byPlayer as $playerId => $raw) {
            $innings = count($raw['innings_runs']);
            $notOuts = $innings - (isset($inningsOut[$playerId]) ? count($inningsOut[$playerId]) : 0);
            $highestScore = $this->highestScoreInnings($raw['innings_runs'], isset($inningsOut[$playerId]) ? $inningsOut[$playerId] : []);
            $runs = $raw['runs'];
            $ballsFaced = $raw['balls_faced'];
            $average = ($innings - $notOuts) > 0 ? round($runs / ($innings - $notOuts), 2) : null;
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
     * Compute per-match bowling from balls (used by RefreshMatchStatsJob).
     *
     * @return array<int, array{player_id: int, matches: int, innings: int, overs: float, maidens: int, runs_conceded: int, wickets: int, no_balls: int, wides: int, best_bowling_innings: string, best_bowling_match: string, five_wickets: int, ten_wickets: int, average: float|null, economy: float|null, strike_rate: float|null}>
     */
    public function computeBowlingForMatch(int $matchId): array
    {
        $inningsIds = Innings::where('match_id', $matchId)->pluck('id');
        $balls = Ball::whereIn('innings_id', $inningsIds)->orderBy('innings_id')->orderBy('over')->orderBy('ball_in_over')->get();

        $byPlayer = [];
        foreach ($balls as $ball) {
            $pid = $ball->bowler_id;
            $innId = $ball->innings_id;
            if (! isset($byPlayer[$pid])) {
                $byPlayer[$pid] = ['runs_conceded' => 0, 'wickets' => 0, 'no_balls' => 0, 'wides' => 0, 'overs_runs' => [], 'overs_balls' => []];
            }
            $byPlayer[$pid]['runs_conceded'] += $ball->runs + $ball->penalty_runs;
            if ($ball->is_wicket) {
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
        }

        $result = [];
        foreach ($byPlayer as $playerId => $raw) {
            $ballsBowled = $balls->where('bowler_id', $playerId)->count();
            $overs = round($ballsBowled / 6, 2);
            $maidens = 0;
            foreach ($raw['overs_runs'] as $overKey => $runsInOver) {
                if ($runsInOver === 0 && ($raw['overs_balls'][$overKey] ?? 0) >= 6) {
                    $maidens++;
                }
            }
            $runsConceded = $raw['runs_conceded'];
            $wickets = $raw['wickets'];
            $average = $wickets > 0 ? round($runsConceded / $wickets, 2) : null;
            $economy = $overs > 0 ? round($runsConceded / $overs, 2) : null;
            $strikeRate = $wickets > 0 ? round($ballsBowled / $wickets, 2) : null;

            $inningsWicketsRuns = $this->bowlingInningsWicketsRuns($balls->where('bowler_id', $playerId));
            $bestBowlingInnings = $this->bestBowlingInnings($inningsWicketsRuns);
            $fiveWickets = count(array_filter($inningsWicketsRuns, fn ($inningsWicketsRunsItem) => $inningsWicketsRunsItem['wickets'] >= 5));
            $tenWickets = $wickets >= 10 ? 1 : 0;

            $result[] = [
                'player_id' => $playerId,
                'matches' => 1,
                'innings' => count(array_unique(array_map(fn ($overKey) => explode('_', $overKey)[0], array_keys($raw['overs_runs'])))),
                'overs' => $overs,
                'maidens' => $maidens,
                'runs_conceded' => $runsConceded,
                'wickets' => $wickets,
                'no_balls' => $raw['no_balls'],
                'wides' => $raw['wides'],
                'best_bowling_innings' => $bestBowlingInnings,
                'best_bowling_match' => $bestBowlingInnings,
                'five_wickets' => $fiveWickets,
                'ten_wickets' => $tenWickets,
                'average' => $average,
                'economy' => $economy,
                'strike_rate' => $strikeRate,
            ];
        }

        return array_values($result);
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

    /**
     * Compute per-match fielding from balls (used by RefreshMatchStatsJob).
     *
     * @return array<int, array{player_id: int, matches: int, catches: int, run_outs: int, stumpings: int}>
     */
    public function computeFieldingForMatch(int $matchId): array
    {
        $inningsIds = Innings::where('match_id', $matchId)->pluck('id');
        $balls = Ball::whereIn('innings_id', $inningsIds)->where('is_wicket', true)->whereNotNull('fielder_id')->get();

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

    /**
     * Partnership stats for one innings: runs and balls for each batting pair (stand).
     * Derived from ball-by-ball: striker + non_striker per ball; when a wicket falls the stand ends.
     *
     * @return array<int, array{player_1_id: int, player_2_id: int, runs: int, balls: int, wicket_number: int|null}>
     */
    public function partnershipsForInnings(int $inningsId): array
    {
        $balls = Ball::where('innings_id', $inningsId)
            ->orderBy('over')
            ->orderBy('ball_in_over')
            ->get();

        $partnerships = [];
        $currentStriker = null;
        $currentNonStriker = null;
        $runs = 0;
        $ballsCount = 0;
        $wicketNumber = 1;

        foreach ($balls as $ball) {
            $striker = $ball->striker_id;
            $nonStriker = $ball->non_striker_id;

            if ($currentStriker === null) {
                $currentStriker = $striker;
                $currentNonStriker = $nonStriker;
            }

            $runs += $ball->runs + $ball->penalty_runs;
            $ballsCount += 1;

            if ($ball->is_wicket && $ball->out_player_id) {
                $p1 = min($currentStriker, $currentNonStriker);
                $p2 = max($currentStriker, $currentNonStriker);
                $partnerships[] = [
                    'player_1_id' => $p1,
                    'player_2_id' => $p2,
                    'runs' => $runs,
                    'balls' => $ballsCount,
                    'wicket_number' => $wicketNumber,
                ];
                $wicketNumber += 1;
                $runs = 0;
                $ballsCount = 0;
                $currentStriker = null;
                $currentNonStriker = null;
            }
        }

        if ($currentStriker !== null && ($runs > 0 || $ballsCount > 0)) {
            $p1 = min($currentStriker, $currentNonStriker ?? $currentStriker);
            $p2 = max($currentStriker, $currentNonStriker ?? $currentStriker);
            $partnerships[] = [
                'player_1_id' => $p1,
                'player_2_id' => $p2,
                'runs' => $runs,
                'balls' => $ballsCount,
                'wicket_number' => null,
            ];
        }

        return $partnerships;
    }

    /**
     * Partnership stats for a match (both innings).
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

    /**
     * Accumulative batting stats for a player. Reads from player_batting_stats when tournament_type is set; else computes (e.g. for 'all').
     *
     * @param  TournamentTypeEnum|'all'|null  $eventType  null or 'all' = compute from balls
     * @return array{matches: int, innings: int, not_outs: int, runs: int, balls_faced: int, fours: int, sixes: int, dots: int, highest_score: string, hundreds: int, fifties: int, average: float|null, strike_rate: float|null}
     */
    public function battingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $eventTypeValue = $this->normalizeEventType($eventType);
        if ($eventTypeValue !== null) {
            $row = PlayerBattingStats::where('player_id', $playerId)->where('tournament_type', $eventTypeValue)->first();
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
                    'average' => $row->average,
                    'strike_rate' => $row->strike_rate,
                ];
            }
        }

        return $this->computeBattingForPlayer($playerId, $eventType);
    }

    private function computeBattingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $matchIds = $this->matchIdsForEventType($eventType);
        $inningsIds = Innings::whereIn('match_id', $matchIds)->pluck('id');

        $ballsStriker = Ball::whereIn('innings_id', $inningsIds)->where('striker_id', $playerId)->get();
        $inningsOutIds = Ball::whereIn('innings_id', $inningsIds)->where('is_wicket', true)->where('out_player_id', $playerId)->pluck('innings_id')->unique()->all();

        $inningsRuns = [];
        foreach ($ballsStriker as $ball) {
            $innId = $ball->innings_id;
            $inningsRuns[$innId] = ($inningsRuns[$innId] ?? 0) + $ball->runs_off_bat;
        }
        $inningsOut = array_fill_keys($inningsOutIds, true);
        $innings = count(array_unique(array_merge(array_keys($inningsRuns), $inningsOutIds)));
        if ($innings === 0) {
            return [
                'matches' => 0, 'innings' => 0, 'not_outs' => 0, 'runs' => 0, 'balls_faced' => 0, 'fours' => 0, 'sixes' => 0,
                'highest_score' => '0', 'hundreds' => 0, 'fifties' => 0, 'average' => null, 'strike_rate' => null,
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
        $average = ($innings - $notOuts) > 0 ? round($runs / ($innings - $notOuts), 2) : null;
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

    /** @return string|null tournament_type string or null for 'all' / null */
    private function normalizeEventType(TournamentTypeEnum|string|null $eventType): ?string
    {
        if ($eventType === null || $eventType === 'all') {
            return null;
        }

        return $eventType instanceof TournamentTypeEnum ? $eventType->value : (string) $eventType;
    }

    /**
     * Accumulative bowling stats for a player. Reads from player_bowling_stats when tournament_type is set; else computes.
     *
     * @param  TournamentTypeEnum|'all'|null  $eventType
     * @return array{matches: int, innings: int, overs: float, maidens: int, runs_conceded: int, wickets: int, no_balls: int, wides: int, best_bowling_innings: string, best_bowling_match: string, five_wickets: int, ten_wickets: int, average: float|null, economy: float|null, strike_rate: float|null}
     */
    public function bowlingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $eventTypeValue = $this->normalizeEventType($eventType);
        if ($eventTypeValue !== null) {
            $row = PlayerBowlingStats::where('player_id', $playerId)->where('tournament_type', $eventTypeValue)->first();
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

    private function computeBowlingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $base = Ball::query()
            ->where('bowler_id', $playerId)
            ->join('innings', 'balls.innings_id', '=', 'innings.id')
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id');

        if ($eventType && $eventType !== 'all' && $eventType instanceof TournamentTypeEnum) {
            $base->where('tournaments.tournament_type', $eventType->value);
        } elseif ($eventType && $eventType !== 'all' && is_string($eventType)) {
            $base->where('tournaments.tournament_type', $eventType);
        }

        $balls = $base->select('balls.*')->get();
        $runsConceded = $balls->sum(fn ($b) => $b->runs + $b->penalty_runs);
        $wickets = $balls->where('is_wicket', true)->count();
        $noBalls = $balls->where('is_no_ball', true)->count();
        $wides = $balls->where('is_wide', true)->count();
        $ballsBowled = $balls->count();
        $overs = round($ballsBowled / 6, 2);

        $oversRuns = [];
        foreach ($balls as $b) {
            $k = $b->innings_id.'_'.$b->over;
            $oversRuns[$k] = ($oversRuns[$k] ?? 0) + $b->runs + $b->penalty_runs;
        }
        $maidens = count(array_filter($oversRuns, fn ($v) => $v === 0));

        $inningsWicketsRuns = $this->bowlingInningsWicketsRuns($balls);
        $bestBowlingInnings = $this->bestBowlingInnings($inningsWicketsRuns);
        $fiveWickets = count(array_filter($inningsWicketsRuns, fn ($inningsWicketsRunsItem) => $inningsWicketsRunsItem['wickets'] >= 5));
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
            'best_bowling_match' => $bestBowlingInnings,
            'five_wickets' => $fiveWickets,
            'ten_wickets' => $tenWickets,
            'average' => $wickets > 0 ? round($runsConceded / $wickets, 2) : null,
            'economy' => $overs > 0 ? round($runsConceded / $overs, 2) : null,
            'strike_rate' => $wickets > 0 ? round($ballsBowled / $wickets, 2) : null,
        ];
    }

    /**
     * Accumulative fielding stats for a player. Reads from player_fielding_stats when tournament_type is set; else computes.
     *
     * @param  TournamentTypeEnum|'all'|null  $eventType
     * @return array{matches: int, catches: int, run_outs: int, stumpings: int}
     */
    public function fieldingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $eventTypeValue = $this->normalizeEventType($eventType);
        if ($eventTypeValue !== null) {
            $row = PlayerFieldingStats::where('player_id', $playerId)->where('tournament_type', $eventTypeValue)->first();
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

    private function computeFieldingForPlayer(int $playerId, TournamentTypeEnum|string|null $eventType): array
    {
        $query = Ball::query()
            ->where('is_wicket', true)
            ->where('fielder_id', $playerId)
            ->join('innings', 'balls.innings_id', '=', 'innings.id')
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->select('balls.*');

        if ($eventType && $eventType !== 'all' && $eventType instanceof TournamentTypeEnum) {
            $query->where('tournaments.tournament_type', $eventType->value);
        } elseif ($eventType && $eventType !== 'all' && is_string($eventType)) {
            $query->where('tournaments.tournament_type', $eventType);
        }

        $balls = $query->get();
        $catches = $balls->filter(fn ($b) => $b->dismissal_type?->value === 'caught')->count();
        $runOuts = $balls->filter(fn ($b) => $b->dismissal_type?->value === 'run_out')->count();
        $stumpings = $balls->filter(fn ($b) => $b->dismissal_type?->value === 'stumped')->count();

        $matches = $balls->pluck('innings_id')->unique()->count();

        return [
            'matches' => $matches,
            'catches' => $catches,
            'run_outs' => $runOuts,
            'stumpings' => $stumpings,
        ];
    }

    /**
     * Rankings: list players with accumulative stats for an event type, sorted by a metric.
     *
     * @param  'batting'|'bowling'|'fielding'  $category
     * @param  string  $sort  e.g. runs, ave, sr, wickets, econ, ct
     * @param  int  $minInnings  minimum innings (for batting) or matches (for bowling) to qualify
     * @return array<int, array{player_id: int, user: array|null, stats: array}>
     */
    public function rankings(string $eventType, string $category, string $sort = 'runs', int $minInnings = 0): array
    {
        $et = $eventType === 'open_tournament' ? TournamentTypeEnum::OPEN_TOURNAMENT : ($eventType === 'league' ? TournamentTypeEnum::LEAGUE : TournamentTypeEnum::EMERGING);
        $playerIds = $this->playerIdsWithActivity($et, $category);

        $out = [];
        foreach ($playerIds as $pid) {
            if ($category === 'batting') {
                $s = $this->battingForPlayer($pid, $et);
                if ($minInnings > 0 && $s['innings'] < $minInnings) {
                    continue;
                }
            } elseif ($category === 'bowling') {
                $s = $this->bowlingForPlayer($pid, $et);
                if ($minInnings > 0 && $s['matches'] < $minInnings) {
                    continue;
                }
            } else {
                $s = $this->fieldingForPlayer($pid, $et);
            }
            $out[] = ['player_id' => $pid, 'stats' => $s];
        }

        $out = $this->sortRankings($out, $category, $sort);

        return array_values($out);
    }

    /**
     * 1-based position in the leaderboard for this player, or null if not ranked (no qualifying rows).
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
            $byInn[$inningsId]['wickets'] += $ball->is_wicket ? 1 : 0;
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

    private function matchCountForPlayerBatting(int $playerId, TournamentTypeEnum|string|null $eventType): int
    {
        $q = TournamentMatch::query()
            ->join('innings', 'matches.id', '=', 'innings.match_id')
            ->join('balls', 'innings.id', '=', 'balls.innings_id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->where('balls.striker_id', $playerId)
            ->distinct('matches.id');
        if ($eventType && $eventType !== 'all' && $eventType instanceof TournamentTypeEnum) {
            $q->where('tournaments.tournament_type', $eventType->value);
        } elseif ($eventType && $eventType !== 'all' && is_string($eventType)) {
            $q->where('tournaments.tournament_type', $eventType);
        }

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
        if ($eventType && $eventType !== 'all' && $eventType instanceof TournamentTypeEnum) {
            $q->where('tournaments.tournament_type', $eventType->value);
        } elseif ($eventType && $eventType !== 'all' && is_string($eventType)) {
            $q->where('tournaments.tournament_type', $eventType);
        }

        return $q->count('matches.id');
    }

    private function matchCountWithTenWickets(int $playerId, TournamentTypeEnum|string|null $eventType): int
    {
        $matches = TournamentMatch::query()
            ->join('innings', 'matches.id', '=', 'innings.match_id')
            ->join('balls', 'innings.id', '=', 'balls.innings_id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->where('balls.bowler_id', $playerId)
            ->select('matches.id')
            ->distinct()
            ->pluck('id');
        if ($eventType && $eventType !== 'all' && $eventType instanceof TournamentTypeEnum) {
            $matches = TournamentMatch::query()->whereIn('id', $matches)->whereHas('tournament', fn ($q) => $q->where('tournament_type', $eventType->value))->pluck('id');
        } elseif ($eventType && $eventType !== 'all' && is_string($eventType)) {
            $matches = TournamentMatch::query()->whereIn('id', $matches)->whereHas('tournament', fn ($q) => $q->where('tournament_type', $eventType))->pluck('id');
        }
        $count = 0;
        foreach ($matches as $matchId) {
            $wicketsInMatch = Ball::whereIn('innings_id', Innings::where('match_id', $matchId)->pluck('id'))->where('bowler_id', $playerId)->where('is_wicket', true)->count();
            if ($wicketsInMatch >= 10) {
                $count++;
            }
        }

        return $count;
    }

    private function playerIdsWithActivity(TournamentTypeEnum $eventType, string $category): array
    {
        if ($category === 'batting') {
            return Ball::query()->join('innings', 'balls.innings_id', '=', 'innings.id')
                ->join('matches', 'innings.match_id', '=', 'matches.id')
                ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
                ->where('tournaments.tournament_type', $eventType->value)
                ->distinct()
                ->pluck('balls.striker_id')
                ->filter()
                ->values()
                ->all();
        }
        if ($category === 'bowling') {
            return Ball::query()->join('innings', 'balls.innings_id', '=', 'innings.id')
                ->join('matches', 'innings.match_id', '=', 'matches.id')
                ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
                ->where('tournaments.tournament_type', $eventType->value)
                ->distinct()
                ->pluck('balls.bowler_id')
                ->values()
                ->all();
        }

        return Ball::query()->join('innings', 'balls.innings_id', '=', 'innings.id')
            ->join('matches', 'innings.match_id', '=', 'matches.id')
            ->join('tournaments', 'matches.tournament_id', '=', 'tournaments.id')
            ->where('tournaments.tournament_type', $eventType->value)
            ->where('balls.is_wicket', true)
            ->whereNotNull('balls.fielder_id')
            ->distinct()
            ->pluck('balls.fielder_id')
            ->values()
            ->all();
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

    private function sortRankings(array $out, string $category, string $sort): array
    {
        $desc = in_array($sort, ['runs', 'balls_faced', 'wickets', 'hundreds', 'fifties', 'five_wickets', 'ten_wickets', 'catches', 'run_outs', 'stumpings'], true);
        $key = match ($sort) {
            'runs' => 'runs',
            'average' => 'average',
            'strike_rate' => 'strike_rate',
            'wickets' => 'wickets',
            'economy' => 'economy',
            'catches' => 'catches',
            'run_outs' => 'run_outs',
            'stumpings' => 'stumpings',
            default => 'runs',
        };
        usort($out, function ($a, $b) use ($key, $desc) {
            $sa = $a['stats'][$key] ?? 0;
            $sb = $b['stats'][$key] ?? 0;
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
