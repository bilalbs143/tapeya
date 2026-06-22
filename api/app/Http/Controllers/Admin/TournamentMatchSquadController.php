<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreMatchSquadRequest;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Support\MatchSquadRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TournamentMatchSquadController extends Controller
{
    use BaseControllerTrait;

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

    public function store(StoreMatchSquadRequest $request, TournamentMatch $match, Team $team): JsonResponse
    {
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = $request->validated('player_ids');

        if ($error = MatchSquadRules::matchSquadSizeError($match, count($playerIds))) {
            return $this->conflict($error);
        }

        $squadCount = $team->players()
            ->whereIn('users.id', $playerIds)
            ->count();

        if ($squadCount !== count($playerIds)) {
            return $this->forbidden('All players must belong to the team-level squad before being added to the match squad.');
        }

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
