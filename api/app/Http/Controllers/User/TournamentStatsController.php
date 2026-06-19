<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\PlayerStatsService;
use App\Services\TournamentStandingsService;
use Illuminate\Http\JsonResponse;

class TournamentStatsController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly TournamentStandingsService $standingsService,
    ) {}

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

        if ($numberOfGroups <= 1) {
            return $this->success([
                'tournament_id' => $tournament->id,
                'standings' => $this->standingsService->computeForTournament($tournament),
            ]);
        }

        $groups = [];
        $tournamentTeams = $tournament->teams()->get();
        $allMatches = $tournament->matches()->with($this->standingsService->matchRelationsForStandings())->get();

        for ($groupIndex = 1; $groupIndex <= $numberOfGroups; $groupIndex++) {
            $teamsInGroup = $tournamentTeams->filter(fn ($t) => (int) ($t->pivot->group_index ?? 0) === $groupIndex);
            $matchesInGroup = $allMatches->filter(fn ($m) => $m->group_index !== null && (int) $m->group_index === $groupIndex);

            $groups[] = [
                'group_index' => $groupIndex,
                'group_name' => 'Group '.$groupIndex,
                'standings' => $this->standingsService->computeStandingsForTeamsAndMatches($teamsInGroup->values(), $matchesInGroup->values()),
            ];
        }

        return $this->success([
            'tournament_id' => $tournament->id,
            'number_of_groups' => $numberOfGroups,
            'groups' => $groups,
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

            // retired_hurt has is_wicket=false per data contract, but guard defensively
            // against any inconsistent rows so they don't inflate the not-out denominator.
            if ($ball->is_wicket && $ball->out_player_id && ! $ball->isRetiredHurt()) {
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
                // Only credit the bowler for dismissals that are bowler wickets (not run outs etc.).
                if ($ball->is_wicket && $ball->dismissal_type?->countsAsBowlerWicket()) {
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

            $notOuts = $inningsCount - $outs;
            $average = PlayerStatsService::battingAverage($runs, $inningsCount, $notOuts);

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
