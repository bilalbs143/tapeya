<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StorePlayingElevenRequest;
use App\Models\Team;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PlayingElevenController extends Controller
{
    use BaseControllerTrait;

    /**
     * Get the playing eleven (player ids) for a team in a match.
     */
    public function show(TournamentMatch $match, Team $team): JsonResponse
    {
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = DB::table('match_players')
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
     * Select playing eleven for a given team in a match (after toss, Step 6 in docs).
     *
     * Only organizers can manage playing elevens.
     * Players must already be in the match squad for this match + team.
     */
    public function store(StorePlayingElevenRequest $request, TournamentMatch $match, Team $team): JsonResponse
    {
        $authUser = $request->user();

        if ($match->tournament->organizer_id !== $authUser->id) {
            return $this->forbidden('Only the tournament organizer can select playing elevens.');
        }

        // Team must be part of this match (home or away).
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = $request->validated('player_ids');

        // Ensure all players are already in the match squad.
        $squadCount = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->whereIn('user_id', $playerIds)
            ->count();

        if ($squadCount !== count($playerIds)) {
            return $this->forbidden('All players in the playing eleven must be in the match squad.');
        }

        // Enforce playing eleven size: must equal players_per_side for the match.
        if (count($playerIds) !== (int) $match->players_per_side) {
            return $this->forbidden('Playing eleven size must match players_per_side for the match.');
        }

        // Replace existing playing eleven for this match+team.
        DB::table('match_players')
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
                'playing_role' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($rows) {
            DB::table('match_players')->insert($rows);
        }

        return $this->success(
            [
                'match_id' => $match->id,
                'team_id' => $team->id,
                'player_ids' => $playerIds,
            ],
            'Playing eleven updated.',
            'SUCCESS'
        );
    }
}
