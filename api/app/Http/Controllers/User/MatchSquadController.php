<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreMatchSquadRequest;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Services\MatchParticipationService;
use App\Support\MatchSquadRules;
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

        $teamSettings = DB::table('match_team_settings')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->first(['wicket_keeper_id', 'captain_id']);

        return $this->success([
            'match_id' => $match->id,
            'team_id' => $team->id,
            'player_ids' => $playerIds,
            'wicket_keeper_id' => $teamSettings?->wicket_keeper_id !== null ? (int) $teamSettings->wicket_keeper_id : null,
            'captain_id' => $teamSettings?->captain_id !== null ? (int) $teamSettings->captain_id : null,
        ]);
    }

    /**
     * Announce match squad for a given team in a match (Step 5 in docs).
     *
     * Only organizers can manage match squads.
     * Players must belong to the team's team-level squad (team_user).
     */
    public function store(
        StoreMatchSquadRequest $request,
        TournamentMatch $match,
        Team $team,
        MatchParticipationService $participationService,
    ): JsonResponse {
        $authUser = $request->user();

        if (! $authUser->canOperateMatchInApp($match)) {
            return $this->forbidden('You cannot manage match squads for this match.');
        }

        // Team must be part of this match (home or away).
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = $request->validated('player_ids');

        if ($error = MatchSquadRules::matchSquadSizeError($match, count($playerIds))) {
            return $this->conflict($error);
        }

        if ($participationService->matchHasBalls($match)) {
            $participated = $participationService->participatedPlayerIds($match, (int) $team->id);
            $missing = array_diff($participated, $playerIds);
            if ($missing !== []) {
                return $this->conflict(
                    'Players who have already participated cannot be removed from the match squad.',
                );
            }
        }

        if ($error = MatchSquadRules::rosterSubsetError($match, $team, $playerIds)) {
            return $this->forbidden($error);
        }

        // Replace existing match squad for this match+team atomically.
        // Both the delete and insert must succeed together to avoid leaving the match
        // squad in an empty state if the process crashes between the two statements.
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

        DB::transaction(function () use ($match, $team, $rows) {
            DB::table('match_squads')
                ->where('match_id', $match->id)
                ->where('team_id', $team->id)
                ->delete();

            if ($rows) {
                DB::table('match_squads')->insert($rows);
            }
        });

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
