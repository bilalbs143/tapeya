<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\Team\StoreTeamRequest;
use App\Http\Requests\Admin\Team\UpdateTeamRequest;
use App\Http\Resources\User\TeamResource;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Support\Media\MediaDisk;
use Illuminate\Http\JsonResponse;

class TeamController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Team::class, TeamResource::class, 'team');
    }

    protected function baseQuery()
    {
        return Team::query()->with(['owner', 'creator']);
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $data = $request->validated();
        $ownerId = (int) $data['owner_user_id'];

        unset($data['owner_user_id'], $data['logo']);

        User::findOrFail($ownerId);

        $team = Team::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'country' => $data['country'],
            'city' => $data['city'],
            'sponsor' => Team::normalizeFreeText($data['sponsor'] ?? null),
            'icon_players' => Team::normalizeFreeText($data['icon_players'] ?? null),
            'user_id' => $ownerId,
            'created_by' => $request->user()?->id,
        ]);

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
        $ownerId = $data['owner_user_id'] ?? null;
        $hasSponsor = array_key_exists('sponsor', $data);
        $hasIcons = array_key_exists('icon_players', $data);

        unset($data['owner_user_id'], $data['sponsor'], $data['icon_players'], $data['logo']);

        $team = $this->refresh($team);
        $team->fill($data);

        if ($ownerId !== null) {
            User::findOrFail((int) $ownerId);
            $team->user_id = (int) $ownerId;
        }
        if ($hasSponsor) {
            $team->sponsor = Team::normalizeFreeText($request->validated('sponsor'));
        }
        if ($hasIcons) {
            $team->icon_players = Team::normalizeFreeText($request->validated('icon_players'));
        }

        $team->save();
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
        MediaDisk::delete($team->getRawOriginal('logo'));
        $team->delete();

        return $this->noContent();
    }
}
