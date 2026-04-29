<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTeamSquadRequest;
use App\Http\Resources\User\UserResource;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;

class TournamentTeamSquadController extends Controller
{
    use BaseControllerTrait;

    public function show(Tournament $tournament, Team $team): JsonResponse
    {
        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        $team->load('players');

        return $this->success(UserResource::collection($team->players));
    }

    public function store(StoreTeamSquadRequest $request, Tournament $tournament, Team $team): JsonResponse
    {
        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        $playerIds = $request->validated('player_ids');
        $team->players()->sync($playerIds);
        $team->load('players');

        return $this->success(
            [
                'team_id' => $team->id,
                'player_ids' => $team->players->pluck('id')->values()->all(),
            ],
            'Team squad updated.',
            'SUCCESS'
        );
    }
}
