<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreMatchSquadRequest;
use App\Models\Team;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MatchSquadController extends Controller
{
    use BaseControllerTrait;

    /**
     * Get the announced squad (player ids) for a team in a match.
     */
    public function show(TournamentMatch $match, Team $team): JsonResponse
    {
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->pluck('user_id')
            ->values()
            ->all();

        return $this->success([
            'match_id' => $match->id,
            'team_id' => $team->id,
            'player_ids' => $playerIds,
        ]);
    }

    /**
     * Announce match squad for a given team in a match (Step 5 in docs).
     *
     * Only organizers can manage match squads.
     * Players must belong to the team's team-level squad (team_user).
     */
    public function store(StoreMatchSquadRequest $request, TournamentMatch $match, Team $team): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canOperateTournamentInApp($match->tournament)) {
            return $this->forbidden('You cannot manage match squads for this tournament.');
        }

        // Team must be part of this match (home or away).
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = $request->validated('player_ids');

        // Ensure all players are in the team-level squad (team_user).
        $squadCount = $team->players()
            ->whereIn('users.id', $playerIds)
            ->count();

        if ($squadCount !== count($playerIds)) {
            return $this->forbidden('All players must belong to the team-level squad before being added to the match squad.');
        }

        // Replace existing match squad for this match+team with new players.
        DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->delete();

        $now = now();
        $rows = [];
        foreach ($playerIds as $userId) {
            $rows[] = [
                'match_id' => $match->id,
                'team_id' => $team->id,
                'user_id' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows) {
            DB::table('match_squads')->insert($rows);
        }

        return $this->success(
            [
                'match_id' => $match->id,
                'team_id' => $team->id,
                'player_ids' => $playerIds,
            ],
            'Match squad updated.',
            'SUCCESS'
        );
    }
}
