<?php

namespace App\Http\Controllers\User;

use App\Enums\User\AppRoleEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTeamRequest;
use App\Http\Requests\User\StoreTeamSquadRequest;
use App\Http\Resources\User\TeamResource;
use App\Http\Resources\User\UserResource;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    use BaseControllerTrait;

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
     * Create a team for a sponsor.
     *
     * - If sponsor_user_id is omitted, the authenticated user is the sponsor (creating their own team).
     * - If sponsor_user_id is provided and differs from the authenticated user, we treat this as
     *   organizer-on-behalf-of-sponsor; created_by is set to the authenticated user.
     */
    public function store(StoreTeamRequest $request): JsonResponse
    {
        $authUser = $request->user();
        $data = $request->validated();

        $sponsorId = $data['sponsor_user_id'] ?? $authUser->id;
        $iconPlayerIds = $data['icon_player_ids'] ?? [];

        unset($data['sponsor_user_id'], $data['icon_player_ids']);
        $this->storeImage($request, 'logo', 'teams', $data);

        // Authorization: sponsors can create their own teams; organizers can create on behalf of sponsors.
        $isSponsor = $authUser->hasRole(AppRoleEnum::SPONSOR);
        $isOrganizer = $authUser->hasRole(AppRoleEnum::ORGANIZER);

        if ((int) $sponsorId === (int) $authUser->id) {
            if (! $isSponsor) {
                return $this->forbidden('Only sponsors can create their own teams.');
            }
        } else {
            if (! $isOrganizer) {
                return $this->forbidden('Only organizers can create teams on behalf of sponsors.');
            }

            /** @var User $sponsor */
            $sponsor = User::findOrFail($sponsorId);
            if (! $sponsor->hasRole(AppRoleEnum::SPONSOR)) {
                return $this->forbidden('Sponsor user must have the sponsor role.');
            }
        }

        $team = Team::create([
            'name' => $data['name'],
            'logo' => $data['logo'] ?? null,
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
            'user_id' => $sponsorId,
            'created_by' => $authUser?->id,
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
     * Get the team-level squad (players belonging to this team).
     * GET /teams/{team}/squad
     */
    public function showSquad(Team $team): JsonResponse
    {
        $authUser = request()->user();
        $isSponsor = $authUser->hasRole(AppRoleEnum::SPONSOR);
        $isOrganizer = $authUser->hasRole(AppRoleEnum::ORGANIZER);

        if ((int) $team->user_id === (int) $authUser->id) {
            if (! $isSponsor) {
                return $this->forbidden('Only sponsors can view their own team squad.');
            }
        } else {
            if (! $isOrganizer) {
                return $this->forbidden('Only organizers can view squads for other sponsors.');
            }
        }

        $team->load('players');

        return $this->success(UserResource::collection($team->players));
    }

    /**
     * Create or update the team-level squad (players belonging to this team).
     *
     * Only the team sponsor or an organizer can manage the squad.
     */
    public function storeSquad(StoreTeamSquadRequest $request, Team $team): JsonResponse
    {
        $authUser = $request->user();

        $isSponsor = $authUser->hasRole(AppRoleEnum::SPONSOR);
        $isOrganizer = $authUser->hasRole(AppRoleEnum::ORGANIZER);

        // Only sponsor of this team or organizer can manage squad
        if ((int) $team->user_id === (int) $authUser->id) {
            if (! $isSponsor) {
                return $this->forbidden('Only sponsors can manage their own team squad.');
            }
        } else {
            if (! $isOrganizer) {
                return $this->forbidden('Only organizers can manage squads for other sponsors.');
            }
        }

        $playerIds = $request->validated('player_ids');

        // Set the team-level squad: replace existing squad with given players
        $team->players()->sync($playerIds);

        $team->load(['players']);

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
