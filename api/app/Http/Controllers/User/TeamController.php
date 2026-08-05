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
     * GET /teams?search=... — optional search by code or name (partial match).
     */
    public function index(): JsonResponse
    {
        $search = request()->str('search')->trim();
        $query = Team::query()
            ->with(['sponsor', 'iconPlayers'])
            ->orderBy('name');

        if ($search->isNotEmpty()) {
            $term = '%'.mb_strtolower($search->toString()).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(code) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(name) LIKE ?', [$term]);
            });
        }

        $teams = $query->limit(50)->get();

        return $this->success(TeamResource::collection($teams));
    }

    /**
     * Create a team owned by the authenticated user.
     *
     * App users may only create a team for themselves (assignment-based ownership).
     * Creating a team on behalf of another user is admin-only.
     */
    public function store(StoreTeamRequest $request): JsonResponse
    {
        $authUser = $request->user();
        $data = $request->validated();

        $sponsorId = isset($data['sponsor_user_id']) ? (int) $data['sponsor_user_id'] : (int) $authUser->id;
        $iconPlayerIds = $data['icon_player_ids'] ?? [];

        unset($data['sponsor_user_id'], $data['icon_player_ids']);

        if ($sponsorId !== (int) $authUser->id) {
            return $this->forbidden('You can only create a team for yourself.');
        }

        $team = Team::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
            'user_id' => $authUser->id,
            'created_by' => $authUser->id,
        ]);

        if (! empty($iconPlayerIds)) {
            $team->iconPlayers()->sync($iconPlayerIds);
        }

        $team->load(['sponsor', 'creator', 'iconPlayers']);

        return $this->success(
            new TeamResource($team),
            'Team created.',
            'CREATED'
        );
    }

    /**
     * Update team metadata (name, code, country, city, icon players).
     *
     * Allowed for the team owner or tournament staff of a tournament that includes this team.
     * Ownership changes are admin-only.
     */
    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canManageTeam($team)) {
            return $this->forbidden('Only the team owner or tournament staff for this team can edit it.');
        }

        $data = $request->validated();
        $iconPlayerIds = $data['icon_player_ids'] ?? [];

        if (isset($data['sponsor_user_id']) && (int) $data['sponsor_user_id'] !== (int) $team->user_id) {
            return $this->forbidden('Only administrators can change team ownership.');
        }

        $team->update([
            'name' => $data['name'],
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
        ]);

        $team->iconPlayers()->sync($iconPlayerIds);
        $team->load(['sponsor', 'creator', 'iconPlayers']);

        return $this->success(new TeamResource($team), 'Team updated.', 'SUCCESS');
    }

    /**
     * Get the team-level squad (players belonging to this team).
     * GET /teams/{team}/squad
     *
     * Any authenticated app user may view (squad is public within the app).
     */
    public function showSquad(Team $team): JsonResponse
    {
        $team->load('players');

        return $this->success(UserResource::collection($team->players));
    }

    /**
     * Create or update the team-level squad (players belonging to this team).
     *
     * Allowed for the team owner or tournament staff of a tournament that includes this team.
     */
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
