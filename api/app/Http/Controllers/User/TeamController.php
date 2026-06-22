<?php

namespace App\Http\Controllers\User;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTeamRequest;
use App\Http\Requests\User\StoreTeamSquadRequest;
use App\Http\Requests\User\UpdateTeamRequest;
use App\Http\Resources\User\TeamResource;
use App\Http\Resources\User\UserResource;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
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
     * Create a team for a sponsor.
     *
     * - If sponsor_user_id is omitted, the authenticated user is the team owner (sponsor role added if missing).
     * - If sponsor_user_id is provided and differs from the authenticated user, only organizers may do this;
     *   the chosen owner receives the sponsor role if they do not already have it.
     */
    public function store(StoreTeamRequest $request): JsonResponse
    {
        $authUser = $request->user();
        $data = $request->validated();

        $sponsorId = $data['sponsor_user_id'] ?? $authUser->id;
        $iconPlayerIds = $data['icon_player_ids'] ?? [];

        unset($data['sponsor_user_id'], $data['icon_player_ids']);

        $isOrganizer = $authUser->hasRole(AppRoleEnum::ORGANIZER);
        if ((int) $sponsorId !== (int) $authUser->id && ! $isOrganizer) {
            return $this->forbidden('Only organizers can create teams on behalf of sponsors.');
        }

        $owner = User::findOrFail($sponsorId);
        $this->ensureAppUserHasSponsorRole($owner);

        $team = Team::create([
            'name' => $data['name'],
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
     * Update team metadata (name, code, country, city, sponsor, icon players).
     *
     * Only the team owner (sponsor) or an organizer can update.
     * Only organizers may change team ownership.
     */
    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $authUser = $request->user();
        $isOrganizer = $authUser->hasRole(AppRoleEnum::ORGANIZER);

        if ((int) $team->user_id !== (int) $authUser->id && ! $isOrganizer) {
            return $this->forbidden('Only the team owner or an organizer can edit this team.');
        }

        $data = $request->validated();
        $sponsorId = isset($data['sponsor_user_id']) ? (int) $data['sponsor_user_id'] : (int) $team->user_id;
        $iconPlayerIds = $data['icon_player_ids'] ?? [];

        if ($sponsorId !== (int) $team->user_id) {
            if (! $isOrganizer) {
                return $this->forbidden('Only organizers can change team ownership.');
            }
            $newOwner = User::findOrFail($sponsorId);
            $this->ensureAppUserHasSponsorRole($newOwner);
        }

        $team->update([
            'name' => $data['name'],
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
            'user_id' => $sponsorId,
        ]);

        $team->iconPlayers()->sync($iconPlayerIds);
        $team->load(['sponsor', 'creator', 'iconPlayers']);

        return $this->success(new TeamResource($team), 'Team updated.', 'SUCCESS');
    }

    /**
     * Get the team-level squad (players belonging to this team).
     * GET /teams/{team}/squad
     *
     * Any authenticated app user may view (squad is public within the app; changing it is still sponsor/organizer-only).
     */
    public function showSquad(Team $team): JsonResponse
    {
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
            if (! $isOrganizer && ! $authUser->canManageTeamSquadAsTournamentStaff($team)) {
                return $this->forbidden('Only organizers or tournament staff can manage squads for other sponsors.');
            }
        }

        $playerIds = $request->validated('player_ids');

        $conflictMessage = $this->squadValidator->conflictMessageForTeam($team, $playerIds);
        if ($conflictMessage !== null) {
            return $this->failure($conflictMessage, 'VALIDATION_ERROR', [
                'player_ids' => [$conflictMessage],
            ]);
        }

        // Set the team-level squad: replace existing squad with given players
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

    /** Team owner must carry the sponsor role; attach without removing other app roles. */
    private function ensureAppUserHasSponsorRole(User $user): void
    {
        if ($user->hasRole(AppRoleEnum::SPONSOR)) {
            return;
        }

        $sponsorRole = Role::query()
            ->where('slug', AppRoleEnum::SPONSOR->value)
            ->where('guard', RoleGuardEnum::APP->value)
            ->firstOrFail();

        $user->roles()->syncWithoutDetaching([$sponsorRole->id]);
    }
}
