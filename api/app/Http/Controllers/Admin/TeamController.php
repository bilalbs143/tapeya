<?php

namespace App\Http\Controllers\Admin;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Http\Requests\Admin\Team\StoreTeamRequest;
use App\Http\Requests\Admin\Team\UpdateTeamRequest;
use App\Http\Resources\User\TeamResource;
use App\Models\Role;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TeamController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Team::class, TeamResource::class, 'team');
    }

    protected function baseQuery()
    {
        return Team::query()->with(['sponsor', 'creator', 'iconPlayers']);
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $data = $request->validated();
        $sponsorId = (int) $data['sponsor_user_id'];
        $iconPlayerIds = $data['icon_player_ids'] ?? [];

        unset($data['sponsor_user_id'], $data['icon_player_ids']);
        $this->storeImage($request, 'logo', 'teams', $data);

        $owner = User::findOrFail($sponsorId);
        $this->ensureAppUserHasSponsorRole($owner);

        $team = Team::create([
            'name' => $data['name'],
            'logo' => $data['logo'] ?? null,
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
            'user_id' => $sponsorId,
            'created_by' => $request->user()?->id,
        ]);

        if (! empty($iconPlayerIds)) {
            $team->iconPlayers()->sync($iconPlayerIds);
        }

        $team = $this->refresh($team);

        return $this->success(new TeamResource($team), 'Team created.', 'CREATED');
    }

    public function show(Team $team): JsonResponse
    {
        return $this->_show($team);
    }

    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $data = $request->validated();
        $iconPlayerIds = array_key_exists('icon_player_ids', $data) ? $data['icon_player_ids'] : null;
        $sponsorId = $data['sponsor_user_id'] ?? null;

        unset($data['icon_player_ids'], $data['sponsor_user_id'], $data['logo']);
        $this->storeImage($request, 'logo', 'teams', $data, $team);

        $team = $this->refresh($team);
        $team->fill($data);

        if ($sponsorId !== null) {
            $owner = User::findOrFail((int) $sponsorId);
            $this->ensureAppUserHasSponsorRole($owner);
            $team->user_id = (int) $sponsorId;
        }

        $team->save();

        if (is_array($iconPlayerIds)) {
            $team->iconPlayers()->sync($iconPlayerIds);
        }

        $team = $this->refresh($team);

        return $this->success(new TeamResource($team), 'Team updated.');
    }

    public function destroy(Team $team): JsonResponse
    {
        if (TournamentMatch::query()
            ->where('home_team_id', $team->id)
            ->orWhere('away_team_id', $team->id)
            ->orWhere('winning_team_id', $team->id)
            ->orWhere('toss_winner_team_id', $team->id)
            ->exists()) {
            return $this->failure('Cannot delete a team that appears on matches. Remove or reassign matches first.', 'VALIDATION_ERROR', 422);
        }

        $team = $this->refresh($team);
        $disk = Storage::disk(config('filesystems.media_disk'));
        if ($team->logo) {
            $disk->delete($team->logo);
        }
        $team->delete();

        return $this->noContent();
    }

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
