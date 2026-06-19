<?php

namespace App\Services;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Ball;
use App\Models\Innings;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

/**
 * Tournament points-table computation shared by API and broadcast graphics context.
 */
final class TournamentStandingsService
{
    /**
     * Standings for all teams in a tournament (single-table tournaments).
     *
     * @return array<int, array<string, mixed>>
     */
    public function computeForTournament(Tournament $tournament): array
    {
        $matchWith = $this->matchRelationsForStandings();

        return $this->computeStandingsForTeamsAndMatches(
            $tournament->teams()->get(),
            $tournament->matches()->with($matchWith)->get(),
        );
    }

    /**
     * Standings for the match's tournament (overlay default).
     *
     * @return array<int, array<string, mixed>>
     */
    public function computeForMatch(TournamentMatch $match): array
    {
        $tournament = $match->tournament;
        if ($tournament === null) {
            return [];
        }

        $numberOfGroups = max(1, (int) ($tournament->number_of_groups ?? 1));
        if ($numberOfGroups <= 1) {
            return $this->computeForTournament($tournament);
        }

        $groupIndex = (int) ($match->group_index ?? 0);
        if ($groupIndex <= 0) {
            return $this->computeForTournament($tournament);
        }

        $matchWith = $this->matchRelationsForStandings();
        $teams = $tournament->teams()->get()->filter(
            fn (Team $team) => (int) ($team->pivot->group_index ?? 0) === $groupIndex
        );
        $matches = $tournament->matches()->with($matchWith)->get()->filter(
            fn (TournamentMatch $groupMatch) => $groupMatch->group_index !== null
                && (int) $groupMatch->group_index === $groupIndex
        );

        return $this->computeStandingsForTeamsAndMatches($teams->values(), $matches->values());
    }

    /**
     * @param  Collection<int, Team>  $teams
     * @param  Collection<int, TournamentMatch>  $matches
     * @return array<int, array<string, mixed>>
     */
    public function computeStandingsForTeamsAndMatches(Collection $teams, Collection $matches): array
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
     * @return array<int|string, mixed>
     */
    public function matchRelationsForStandings(): array
    {
        return [
            'homeTeam',
            'awayTeam',
            'innings' => fn ($q) => $q->orderBy('innings_number'),
            'innings.balls',
        ];
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
     * @return array{runs: int, legal_balls: int}
     */
    private function inningsRunsAndLegalBalls(Innings $innings): array
    {
        $balls = $innings->relationLoaded('balls')
            ? $innings->balls
            : $innings->balls()->get();

        $runs = (int) $balls->sum(fn (Ball $b) => (int) ($b->runs ?? 0) + (int) ($b->penalty_runs ?? 0));
        $legalBalls = $balls->filter(fn (Ball $b) => $b->isLegalDelivery())->count();

        return ['runs' => $runs, 'legal_balls' => $legalBalls];
    }
}
