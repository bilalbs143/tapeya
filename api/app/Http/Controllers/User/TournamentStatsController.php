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
use Illuminate\Support\Collection;

class TournamentStatsController extends Controller
{
    use BaseControllerTrait;

    /**
     * Tournament standings / points table for a single tournament.
     *
     * When number_of_groups <= 1: returns { tournament_id, standings: [...] } (single table).
     * When number_of_groups > 1: returns { tournament_id, number_of_groups, groups: [ { group_index, group_name, standings }, ... ] }.
     *
     * Basic rules: Win = 2 points, Tie = 1 each, No-result = 1 each (tracked separately via
     * `is_no_result` on the match), Loss = 0.
     * NRR (net run rate): (runs for / overs faced) − (runs against / overs bowled) on completed
     * matches only; overs from legal deliveries (six per over), same as ball-by-ball scoring.
     */
    public function standings(Tournament $tournament): JsonResponse
    {
        $numberOfGroups = max(1, (int) ($tournament->number_of_groups ?? 1));
        $matchWith = $this->matchRelationsForStandings();

        if ($numberOfGroups <= 1) {
            return $this->success([
                'tournament_id' => $tournament->id,
                'standings' => $this->computeStandingsForTeamsAndMatches($tournament->teams()->get(), $tournament->matches()->with($matchWith)->get()),
            ]);
        }

        $groups = [];
        $tournamentTeams = $tournament->teams()->get();
        $allMatches = $tournament->matches()->with($matchWith)->get();

        for ($groupIndex = 1; $groupIndex <= $numberOfGroups; $groupIndex++) {
            $teamsInGroup = $tournamentTeams->filter(fn ($t) => (int) ($t->pivot->group_index ?? 0) === $groupIndex);
            $matchesInGroup = $allMatches->filter(fn ($m) => $m->group_index !== null && (int) $m->group_index === $groupIndex);

            $groups[] = [
                'group_index' => $groupIndex,
                'group_name' => 'Group '.$groupIndex,
                'standings' => $this->computeStandingsForTeamsAndMatches($teamsInGroup->values(), $matchesInGroup->values()),
            ];
        }

        return $this->success([
            'tournament_id' => $tournament->id,
            'number_of_groups' => $numberOfGroups,
            'groups' => $groups,
        ]);
    }

    /**
     * @param  Collection<int, Team>  $teams
     * @param  Collection<int, TournamentMatch>  $matches
     * @return array<int, array<string, mixed>>
     */
    private function computeStandingsForTeamsAndMatches($teams, $matches): array
    {
        $table = [];

        foreach ($teams as $team) {
            $table[$team->id] = $this->defaultStandingsTeamRow($team->id, $team->name);
        }

        foreach ($matches as $match) {
            $homeId = $match->home_team_id;
            $awayId = $match->away_team_id;

            if (! $homeId || ! $awayId) {
                continue;
            }

            if (! isset($table[$homeId])) {
                $table[$homeId] = $this->defaultStandingsTeamRow(
                    (int) $homeId,
                    $match->homeTeam?->name ?? 'Team '.$homeId
                );
            }
            if (! isset($table[$awayId])) {
                $table[$awayId] = $this->defaultStandingsTeamRow(
                    (int) $awayId,
                    $match->awayTeam?->name ?? 'Team '.$awayId
                );
            }

            $isCompleted = $match->status === MatchStatusEnum::COMPLETED;
            $hasResult = $isCompleted && $match->winning_team_id !== null;

            if (! $isCompleted) {
                continue;
            }

            $table[$homeId]['played']++;
            $table[$awayId]['played']++;

            if ($hasResult) {
                $winnerId = (int) $match->winning_team_id;
                $loserId = $winnerId === (int) $homeId ? $awayId : $homeId;

                if (isset($table[$winnerId])) {
                    $table[$winnerId]['won']++;
                    $table[$winnerId]['points'] += 2;
                }
                if (isset($table[$loserId])) {
                    $table[$loserId]['lost']++;
                }
            } else {
                if ($match->is_no_result) {
                    $table[$homeId]['no_result']++;
                    $table[$awayId]['no_result']++;
                } else {
                    $table[$homeId]['tied']++;
                    $table[$awayId]['tied']++;
                }
                $table[$homeId]['points'] += 1;
                $table[$awayId]['points'] += 1;
            }

            foreach ($match->innings as $innings) {
                $batId = (int) $innings->batting_team_id;
                $bowlId = (int) $innings->bowling_team_id;
                $tot = $this->inningsRunsAndLegalBalls($innings);
                if ($tot['legal_balls'] === 0) {
                    continue;
                }
                if (isset($table[$batId])) {
                    $table[$batId]['_runs_for'] += $tot['runs'];
                    $table[$batId]['_legal_balls_for'] += $tot['legal_balls'];
                }
                if (isset($table[$bowlId])) {
                    $table[$bowlId]['_runs_against'] += $tot['runs'];
                    $table[$bowlId]['_legal_balls_against'] += $tot['legal_balls'];
                }
            }
        }

        foreach ($table as $tid => $row) {
            $rf = (int) $row['_runs_for'];
            $bf = (int) $row['_legal_balls_for'];
            $ra = (int) $row['_runs_against'];
            $ba = (int) $row['_legal_balls_against'];
            unset($table[$tid]['_runs_for'], $table[$tid]['_legal_balls_for'], $table[$tid]['_runs_against'], $table[$tid]['_legal_balls_against']);

            if ($row['played'] > 0 && $bf > 0 && $ba > 0) {
                $runRateFor = $rf / ($bf / 6.0);
                $runRateAgainst = $ra / ($ba / 6.0);
                $table[$tid]['nrr'] = round($runRateFor - $runRateAgainst, 3);
            } else {
                $table[$tid]['nrr'] = null;
            }
        }

        $sorted = array_values($table);
        usort($sorted, function (array $a, array $b) {
            if ($a['points'] !== $b['points']) {
                return $b['points'] <=> $a['points'];
            }
            $nrrA = $a['nrr'];
            $nrrB = $b['nrr'];
            if ($nrrA !== null || $nrrB !== null) {
                if ($nrrA === null) {
                    return 1;
                }
                if ($nrrB === null) {
                    return -1;
                }
                if ($nrrB !== $nrrA) {
                    return $nrrB <=> $nrrA;
                }
            }

            return strcmp($a['team_name'], $b['team_name']);
        });

        return $sorted;
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultStandingsTeamRow(int $teamId, string $teamName): array
    {
        return [
            'team_id' => $teamId,
            'team_name' => $teamName,
            'played' => 0,
            'won' => 0,
            'lost' => 0,
            'tied' => 0,
            'no_result' => 0,
            'points' => 0,
            'nrr' => null,
            '_runs_for' => 0,
            '_legal_balls_for' => 0,
            '_runs_against' => 0,
            '_legal_balls_against' => 0,
        ];
    }

    /**
     * @return array<int|string, mixed>
     */
    private function matchRelationsForStandings(): array
    {
        return [
            'homeTeam',
            'awayTeam',
            'innings' => fn ($q) => $q->orderBy('innings_number'),
            'innings.balls',
        ];
    }

    /**
     * Total runs and legal delivery count for one innings (NRR inputs).
     *
     * @return array{runs: int, legal_balls: int}
     */
    private function inningsRunsAndLegalBalls(Innings $innings): array
    {
        $balls = $innings->relationLoaded('balls')
            ? $innings->balls
            : $innings->balls()->get();

        // Same as innings total for scorecard: use `runs` only (see MatchCompletionService).
        $runs = (int) $balls->sum('runs');
        $legalBalls = $balls->filter(fn (Ball $b) => ! $b->is_wide && ! $b->is_no_ball)->count();

        return ['runs' => $runs, 'legal_balls' => $legalBalls];
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
                        'fours' => 0,
                        'sixes' => 0,
                    ];
                }

                $battingByPlayer[$pid]['runs'] += $ball->runs_off_bat;

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
                // Penalty awards are not debited to the bowler's conceded column.
                $bowlingByPlayer[$bowlerId]['runs_conceded'] += $ball->runs;
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
            $economy = $ballsBowled > 0
                ? round(($runsConceded * 6) / $ballsBowled, 2)
                : null;

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
            /** @var User|null $user */
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
            /** @var User|null $user */
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
        $mostFours = array_values(array_slice(array_filter($battingWithNames, fn ($row) => $row['fours'] > 0), 0, 10));

        usort($battingWithNames, fn ($a, $b) => $b['sixes'] <=> $a['sixes']);
        $mostSixes = array_values(array_slice(array_filter($battingWithNames, fn ($row) => $row['sixes'] > 0), 0, 10));

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
