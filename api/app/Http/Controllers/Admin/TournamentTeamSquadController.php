<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTeamSquadRequest;
use App\Http\Resources\User\UserResource;
use App\Models\Team;
use App\Models\Tournament;
use App\Services\Tournament\TournamentTeamSquadValidator;
use Illuminate\Http\JsonResponse;

class TournamentTeamSquadController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly TournamentTeamSquadValidator $squadValidator,
    ) {}

    public function show(Tournament $tournament, Team $team): JsonResponse
    {
        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        $team->load('players');

        return $this->success(UserResource::collection($team->players));
    }

    public function occupancy(Tournament $tournament): JsonResponse
    {
        $excludeTeamId = request()->integer('exclude_team_id') ?: null;

        return $this->success(
            $this->squadValidator->tournamentOccupancy($tournament, $excludeTeamId),
        );
    }

    public function store(StoreTeamSquadRequest $request, Tournament $tournament, Team $team): JsonResponse
    {
        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        $playerIds = $request->validated('player_ids');

        $conflictMessage = $this->squadValidator->conflictMessage($tournament, $team->id, $playerIds);
        if ($conflictMessage !== null) {
            return $this->failure($conflictMessage, 'VALIDATION_ERROR', [
                'player_ids' => [$conflictMessage],
            ]);
        }

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
