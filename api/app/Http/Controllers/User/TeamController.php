<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTeamRequest;
use App\Http\Requests\User\StoreTeamSquadRequest;
use App\Http\Requests\User\UpdateTeamRequest;
use App\Http\Resources\User\TeamResource;
use App\Http\Resources\User\UserResource;
use App\Models\Team;
use App\Services\Tournament\TournamentTeamSquadValidator;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly TournamentTeamSquadValidator $squadValidator,
    ) {}

    /**
     * List/search teams (e.g. for organizer to find a team to attach to tournament).
     * GET /teams?search=... — optional search by code, name, sponsor, or icon players.
     * GET /teams?mine=1 — only teams owned by the authenticated user.
     */
    public function index(): JsonResponse
    {
        $search = request()->str('search')->trim();
        $mine = request()->boolean('mine');
        $query = Team::query()
            ->with(['owner', 'creator'])
            ->orderBy('name');

        if ($mine) {
            $userId = request()->user()?->id;
            if ($userId === null) {
                return $this->forbidden('Authentication required.');
            }
            $query->where('user_id', $userId);
        }

        if ($search->isNotEmpty()) {
            $term = '%'.mb_strtolower($search->toString()).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(code) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(sponsor, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(icon_players, \'\')) LIKE ?', [$term]);
            });
        }

        $teams = $query->limit(50)->get();

        return $this->success(TeamResource::collection($teams));
    }

    /**
     * Create a team owned by the authenticated user.
     */
    public function store(StoreTeamRequest $request): JsonResponse
    {
        $authUser = $request->user();
        $data = $request->validated();

        $team = Team::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
            'sponsor' => Team::normalizeFreeText($data['sponsor'] ?? null),
            'icon_players' => Team::normalizeFreeText($data['icon_players'] ?? null),
            'user_id' => $authUser->id,
            'created_by' => $authUser->id,
        ]);

        $team->load(['owner', 'creator']);

        return $this->success(
            new TeamResource($team),
            'Team created.',
            'CREATED'
        );
    }

    /**
     * Update team metadata (name, code, country, city, sponsor, icon players).
     */
    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canManageTeam($team)) {
            return $this->forbidden('Only the team owner or tournament staff for this team can edit it.');
        }

        $data = $request->validated();

        $team->update([
            'name' => $data['name'],
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
            'sponsor' => Team::normalizeFreeText($data['sponsor'] ?? null),
            'icon_players' => Team::normalizeFreeText($data['icon_players'] ?? null),
        ]);
        $team->load(['owner', 'creator']);

        return $this->success(new TeamResource($team), 'Team updated.', 'SUCCESS');
    }

    public function showSquad(Team $team): JsonResponse
    {
        $team->load('players');

        return $this->success(UserResource::collection($team->players));
    }

    public function storeSquad(StoreTeamSquadRequest $request, Team $team): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canManageTeam($team)) {
            return $this->forbidden('Only the team owner or tournament staff for this team can manage the squad.');
        }

        $playerIds = $request->validated('player_ids');

        $conflictMessage = $this->squadValidator->conflictMessageForTeam($team, $playerIds);
        if ($conflictMessage !== null) {
            return $this->failure($conflictMessage, 'VALIDATION_ERROR', [
                'player_ids' => [$conflictMessage],
            ]);
        }

        $team->players()->sync($playerIds);

        return $this->success(
            [
                'team_id' => $team->id,
                'player_ids' => array_values(array_map('intval', $playerIds)),
            ],
            'Team squad updated.',
            'SUCCESS'
        );
    }
}
