<?php

namespace App\Http\Controllers\User;

use App\Enums\Event\MatchStatusEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TournamentStatsController extends Controller
{
    use BaseControllerTrait;

    /**
     * Tournament standings / points table for a single tournament.
     *
     * Basic rules:
     * - Win  = 2 points
     * - Tie / no result = 1 point
     * - Loss = 0 points
     *
     * Net run rate (nrr) is reserved for future use and returned as null.
     */
    public function standings(Tournament $tournament): JsonResponse
    {
        $teams = [];

        /** @var \Illuminate\Support\Collection<int, TournamentMatch> $matches */
        $matches = $tournament->matches()
            ->with(['homeTeam', 'awayTeam'])
            ->get();

        /** @var \Illuminate\Support\Collection<int, Team> $tournamentTeams */
        $tournamentTeams = $tournament->teams()->get();

        foreach ($tournamentTeams as $team) {
            $teams[$team->id] = [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'played' => 0,
                'won' => 0,
                'lost' => 0,
                'tied' => 0,
                'no_result' => 0,
                'points' => 0,
                'nrr' => null,
            ];
        }

        foreach ($matches as $match) {
            $homeId = $match->home_team_id;
            $awayId = $match->away_team_id;

            if (! $homeId || ! $awayId) {
                continue;
            }

            if (! isset($teams[$homeId])) {
                $teams[$homeId] = [
                    'team_id' => $homeId,
                    'team_name' => $match->homeTeam?->name ?? 'Team '.$homeId,
                    'played' => 0,
                    'won' => 0,
                    'lost' => 0,
                    'tied' => 0,
                    'no_result' => 0,
                    'points' => 0,
                    'nrr' => null,
                ];
            }
            if (! isset($teams[$awayId])) {
                $teams[$awayId] = [
                    'team_id' => $awayId,
                    'team_name' => $match->awayTeam?->name ?? 'Team '.$awayId,
                    'played' => 0,
                    'won' => 0,
                    'lost' => 0,
                    'tied' => 0,
                    'no_result' => 0,
                    'points' => 0,
                    'nrr' => null,
                ];
            }

            $isCompleted = $match->status === MatchStatusEnum::COMPLETED;
            $hasResult = $isCompleted && $match->winning_team_id !== null;

            if (! $isCompleted) {
                continue;
            }

            $teams[$homeId]['played']++;
            $teams[$awayId]['played']++;

            if ($hasResult) {
                $winnerId = (int) $match->winning_team_id;
                $loserId = $winnerId === (int) $homeId ? $awayId : $homeId;

                if (isset($teams[$winnerId])) {
                    $teams[$winnerId]['won']++;
                    $teams[$winnerId]['points'] += 2;
                }
                if (isset($teams[$loserId])) {
                    $teams[$loserId]['lost']++;
                }
            } else {
                $teams[$homeId]['tied']++;
                $teams[$awayId]['tied']++;
                $teams[$homeId]['points'] += 1;
                $teams[$awayId]['points'] += 1;
            }
        }

        usort($teams, function (array $a, array $b) {
            if ($a['points'] === $b['points']) {
                return strcmp($a['team_name'], $b['team_name']);
            }

            return $b['points'] <=> $a['points'];
        });

        return $this->success([
            'tournament_id' => $tournament->id,
            'standings' => array_values($teams),
        ]);
    }

    /**
     * Tournament season stats (per tournament):
     * - total_fours, total_sixes
     * - top_run_scorers
     * - top_wicket_takers
     * - most_fours
     * - most_sixes
     */
    public function seasonStats(Tournament $tournament): JsonResponse
    {
        $matchIds = TournamentMatch::where('tournament_id', $tournament->id)
            ->pluck('id');

        if ($matchIds->isEmpty()) {
            return $this->success([
                'tournament_id' => $tournament->id,
                'total_fours' => 0,
                'total_sixes' => 0,
                'top_run_scorers' => [],
                'top_wicket_takers' => [],
                'most_fours' => [],
                'most_sixes' => [],
            ]);
        }

        $inningsIds = Innings::whereIn('match_id', $matchIds)->pluck('id');
        $balls = Ball::whereIn('innings_id', $inningsIds)->get();

        $battingByPlayer = [];
        $bowlingByPlayer = [];
        $inningsRunsByPlayer = [];
        $inningsOutByPlayer = [];

        $totalFours = 0;
        $totalSixes = 0;

        foreach ($balls as $ball) {
            $inningsId = $ball->innings_id;

            if ($ball->striker_id) {
                $pid = $ball->striker_id;
                if (! isset($battingByPlayer[$pid])) {
                    $battingByPlayer[$pid] = [
                        'runs' => 0,
                        'balls_faced' => 0,
                        'fours' => 0,
                        'sixes' => 0,
                    ];
                }

                $battingByPlayer[$pid]['runs'] += $ball->runs_off_bat;
                if (! $ball->is_wide) {
                    $battingByPlayer[$pid]['balls_faced'] += 1;
                }

                if ($ball->runs_off_bat === 4) {
                    $battingByPlayer[$pid]['fours'] += 1;
                    $totalFours += 1;
                } elseif ($ball->runs_off_bat === 6) {
                    $battingByPlayer[$pid]['sixes'] += 1;
                    $totalSixes += 1;
                }

                $inningsRunsByPlayer[$pid] = $inningsRunsByPlayer[$pid] ?? [];
                $inningsRunsByPlayer[$pid][$inningsId] = ($inningsRunsByPlayer[$pid][$inningsId] ?? 0) + $ball->runs_off_bat;
            }

            if ($ball->is_wicket && $ball->out_player_id) {
                $outPid = $ball->out_player_id;
                $inningsOutByPlayer[$outPid] = $inningsOutByPlayer[$outPid] ?? [];
                $inningsOutByPlayer[$outPid][$inningsId] = true;
            }

            if ($ball->bowler_id) {
                $bowlerId = $ball->bowler_id;
                if (! isset($bowlingByPlayer[$bowlerId])) {
                    $bowlingByPlayer[$bowlerId] = [
                        'runs_conceded' => 0,
                        'balls_bowled' => 0,
                        'wickets' => 0,
                    ];
                }
                $bowlingByPlayer[$bowlerId]['runs_conceded'] += $ball->runs + $ball->penalty_runs;
                $bowlingByPlayer[$bowlerId]['balls_bowled'] += 1;
                if ($ball->is_wicket) {
                    $bowlingByPlayer[$bowlerId]['wickets'] += 1;
                }
            }
        }

        $battingStats = [];
        foreach ($battingByPlayer as $playerId => $raw) {
            $inningsRuns = $inningsRunsByPlayer[$playerId] ?? [];
            $inningsCount = count($inningsRuns);
            $outInnings = $inningsOutByPlayer[$playerId] ?? [];
            $outs = count($outInnings);
            $notOuts = max(0, $inningsCount - $outs);
            $runs = $raw['runs'];

            $average = $outs > 0 ? round($runs / $outs, 2) : null;

            $battingStats[$playerId] = [
                'player_id' => $playerId,
                'runs' => $runs,
                'innings' => $inningsCount,
                'average' => $average,
                'fours' => $raw['fours'],
                'sixes' => $raw['sixes'],
            ];
        }

        $bowlingStats = [];
        foreach ($bowlingByPlayer as $playerId => $raw) {
            $ballsBowled = $raw['balls_bowled'];
            $overs = $ballsBowled > 0 ? round($ballsBowled / 6, 2) : 0.0;
            $runsConceded = $raw['runs_conceded'];
            $wickets = $raw['wickets'];
            $economy = $overs > 0 ? round($runsConceded / $overs, 2) : null;

            $bowlingStats[$playerId] = [
                'player_id' => $playerId,
                'wickets' => $wickets,
                'overs' => $overs,
                'runs_conceded' => $runsConceded,
                'economy' => $economy,
            ];
        }

        $playerIds = array_unique(array_merge(array_keys($battingStats), array_keys($bowlingStats)));
        $players = User::whereIn('id', $playerIds)->get()->keyBy('id');

        $battingWithNames = [];
        foreach ($battingStats as $pid => $row) {
            /** @var \App\Models\User|null $user */
            $user = $players->get($pid);
            $battingWithNames[] = [
                'player_id' => $pid,
                'name' => $user?->name ?? 'Player '.$pid,
                'runs' => $row['runs'],
                'innings' => $row['innings'],
                'average' => $row['average'],
                'fours' => $row['fours'],
                'sixes' => $row['sixes'],
            ];
        }

        $bowlingWithNames = [];
        foreach ($bowlingStats as $pid => $row) {
            /** @var \App\Models\User|null $user */
            $user = $players->get($pid);
            $bowlingWithNames[] = [
                'player_id' => $pid,
                'name' => $user?->name ?? 'Player '.$pid,
                'wickets' => $row['wickets'],
                'overs' => $row['overs'],
                'runs_conceded' => $row['runs_conceded'],
                'economy' => $row['economy'],
            ];
        }

        usort($battingWithNames, fn ($a, $b) => $b['runs'] <=> $a['runs']);
        usort($bowlingWithNames, fn ($a, $b) => $b['wickets'] <=> $a['wickets']);

        $topRunScorers = array_slice($battingWithNames, 0, 5);
        $topWicketTakers = array_slice($bowlingWithNames, 0, 5);

        usort($battingWithNames, fn ($a, $b) => $b['fours'] <=> $a['fours']);
        $mostFours = array_values(array_filter(array_slice($battingWithNames, 0, 10), fn ($row) => $row['fours'] > 0));

        usort($battingWithNames, fn ($a, $b) => $b['sixes'] <=> $a['sixes']);
        $mostSixes = array_values(array_filter(array_slice($battingWithNames, 0, 10), fn ($row) => $row['sixes'] > 0));

        return $this->success([
            'tournament_id' => $tournament->id,
            'total_fours' => $totalFours,
            'total_sixes' => $totalSixes,
            'top_run_scorers' => $topRunScorers,
            'top_wicket_takers' => $topWicketTakers,
            'most_fours' => $mostFours,
            'most_sixes' => $mostSixes,
        ]);
    }
}
