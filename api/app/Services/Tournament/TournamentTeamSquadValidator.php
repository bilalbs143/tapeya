<?php

namespace App\Services\Tournament;

use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TournamentTeamSquadValidator
{
    /**
     * Players from $playerIds who already belong to a different team in this tournament.
     *
     * @return Collection<int, object{player_id: int, player_name: string, team_id: int, team_name: string}>
     */
    public function crossTeamConflicts(Tournament $tournament, int $excludeTeamId, array $playerIds): Collection
    {
        $playerIds = array_values(array_unique(array_map('intval', $playerIds)));
        if ($playerIds === []) {
            return collect();
        }

        return DB::table('team_user')
            ->join('tournament_team', 'team_user.team_id', '=', 'tournament_team.team_id')
            ->join('teams', 'teams.id', '=', 'team_user.team_id')
            ->join('users', 'users.id', '=', 'team_user.user_id')
            ->where('tournament_team.tournament_id', $tournament->id)
            ->where('team_user.team_id', '!=', $excludeTeamId)
            ->whereIn('team_user.user_id', $playerIds)
            ->select([
                'users.id as player_id',
                DB::raw('COALESCE(NULLIF(users.name, ""), NULLIF(users.nickname, ""), CONCAT("Player #", users.id)) as player_name'),
                'teams.id as team_id',
                'teams.name as team_name',
            ])
            ->distinct()
            ->orderBy('player_name')
            ->get();
    }

    /**
     * All players currently rostered on other teams in the tournament (for client-side filtering).
     *
     * @return array<int, array{player_id: int, player_name: string, team_id: int, team_name: string}>
     */
    public function tournamentOccupancy(Tournament $tournament, ?int $excludeTeamId = null): array
    {
        $query = DB::table('team_user')
            ->join('tournament_team', 'team_user.team_id', '=', 'tournament_team.team_id')
            ->join('teams', 'teams.id', '=', 'team_user.team_id')
            ->join('users', 'users.id', '=', 'team_user.user_id')
            ->where('tournament_team.tournament_id', $tournament->id)
            ->select([
                'users.id as player_id',
                DB::raw('COALESCE(NULLIF(users.name, ""), NULLIF(users.nickname, ""), CONCAT("Player #", users.id)) as player_name'),
                'teams.id as team_id',
                'teams.name as team_name',
            ])
            ->distinct()
            ->orderBy('player_name');

        if ($excludeTeamId !== null) {
            $query->where('team_user.team_id', '!=', $excludeTeamId);
        }

        return $query->get()
            ->map(fn ($row) => [
                'player_id' => (int) $row->player_id,
                'player_name' => (string) $row->player_name,
                'team_id' => (int) $row->team_id,
                'team_name' => (string) $row->team_name,
            ])
            ->values()
            ->all();
    }

    /**
     * Human-readable validation message for cross-team roster conflicts, or null when valid.
     */
    public function conflictMessage(Tournament $tournament, int $excludeTeamId, array $playerIds): ?string
    {
        $conflicts = $this->crossTeamConflicts($tournament, $excludeTeamId, $playerIds);
        if ($conflicts->isEmpty()) {
            return null;
        }

        return $this->formatConflictMessage($conflicts, $tournament);
    }

    /**
     * Validate squad for a team across every tournament it participates in.
     */
    public function conflictMessageForTeam(Team $team, array $playerIds): ?string
    {
        $tournaments = $team->tournaments()->get(['tournaments.id', 'tournaments.tournament_name']);

        foreach ($tournaments as $tournament) {
            $message = $this->conflictMessage($tournament, $team->id, $playerIds);
            if ($message !== null) {
                return $message;
            }
        }

        return null;
    }

    /**
     * @param  Collection<int, object{player_id: int, player_name: string, team_id: int, team_name: string}>  $conflicts
     */
    private function formatConflictMessage(Collection $conflicts, Tournament $tournament): string
    {
        $tournamentName = $tournament->tournament_name ?: 'this tournament';

        if ($conflicts->count() === 1) {
            $row = $conflicts->first();

            return sprintf(
                '%s is already on %s in %s. A player can only be on one team per tournament.',
                $row->player_name,
                $row->team_name,
                $tournamentName,
            );
        }

        $details = $conflicts
            ->map(fn ($row) => sprintf('%s (%s)', $row->player_name, $row->team_name))
            ->implode(', ');

        return sprintf(
            'The following players are already on another team in %s: %s. A player can only be on one team per tournament.',
            $tournamentName,
            $details,
        );
    }
}
