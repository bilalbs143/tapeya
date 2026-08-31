<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\AttachTeamsToTournamentRequest;
use App\Http\Requests\User\UpdateTournamentTeamRequest;
use App\Http\Resources\User\TeamResource;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TournamentTeamsController extends Controller
{
    use BaseControllerTrait;

    /**
     * Teams attached to the tournament (same payload as app organizer list).
     * Optional `filter[search]` — case-insensitive partial match on name or code
     * (same behavior as the global Teams admin list).
     */
    public function index(Tournament $tournament): JsonResponse
    {
        $query = $tournament->teams()
            ->with(['sponsor', 'iconPlayers'])
            ->orderBy('name');

        $search = request()->input('filter.search');
        if (is_string($search) && trim($search) !== '') {
            $term = '%'.addcslashes(mb_strtolower(trim($search)), '%_\\').'%';
            $query->where(function ($q) use ($term): void {
                $q->whereRaw('LOWER(teams.name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(teams.code, \'\')) LIKE ?', [$term]);
            });
        }

        return $this->success(TeamResource::collection($query->get()));
    }

    /**
     * Attach one or more teams to a tournament (same rules as app organizer).
     */
    public function store(AttachTeamsToTournamentRequest $request, Tournament $tournament): JsonResponse
    {
        $teamIds = $request->validated('team_ids');
        $groupIndex = $request->validated('group_index');

        $alreadyAttached = $tournament->teams()->pluck('teams.id')->all();
        $duplicates = array_values(array_intersect($teamIds, $alreadyAttached));
        if (! empty($duplicates)) {
            return $this->failure('Team is already added to this tournament.', 'VALIDATION_ERROR');
        }

        $newTeamIds = array_values(array_diff($teamIds, $alreadyAttached));
        $currentCount = count($alreadyAttached);

        $teamLimit = $tournament->number_of_teams;
        if ($teamLimit !== null && $currentCount + count($newTeamIds) > $teamLimit) {
            return $this->failure(
                'This tournament already has the maximum number of teams ('.$teamLimit.').',
                'VALIDATION_ERROR'
            );
        }

        if ($tournament->number_of_groups > 1 && ($groupIndex === null || $groupIndex < 1 || $groupIndex > $tournament->number_of_groups)) {
            return $this->failure('Group index is required and must be between 1 and '.$tournament->number_of_groups.' for this tournament.', 'VALIDATION_ERROR', 422);
        }

        $pivot = $groupIndex !== null ? ['group_index' => $groupIndex] : [];
        foreach ($teamIds as $teamId) {
            $tournament->teams()->syncWithoutDetaching([$teamId => $pivot]);
        }

        $tournament->load('teams');

        return $this->success(
            [
                'tournament_id' => $tournament->id,
                'team_ids' => $tournament->teams->pluck('id')->values()->all(),
            ],
            'Teams attached to tournament.',
            'SUCCESS'
        );
    }

    /**
     * Update a team's group in the tournament.
     */
    public function update(UpdateTournamentTeamRequest $request, Tournament $tournament, Team $team): JsonResponse
    {
        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        if ($tournament->number_of_groups <= 1) {
            return $this->failure('This tournament does not use groups.', 'VALIDATION_ERROR', 422);
        }

        $groupIndex = $request->validated('group_index');
        $tournament->teams()->updateExistingPivot($team->id, ['group_index' => $groupIndex]);

        return $this->success(
            [
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
                'group_index' => $groupIndex,
            ],
            'Team group updated.',
            'SUCCESS'
        );
    }

    /**
     * Remove a team from a tournament (same constraints as app organizer).
     */
    public function destroy(Tournament $tournament, Team $team): JsonResponse
    {
        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        $matchesInvolvingTeam = $tournament->matches()
            ->where(function ($q) use ($team) {
                $q->where('home_team_id', $team->id)
                    ->orWhere('away_team_id', $team->id);
            });

        $hasScheduledMatch = (clone $matchesInvolvingTeam)
            ->where('status', 'scheduled')
            ->exists();
        $hasMatchAfterToss = (clone $matchesInvolvingTeam)
            ->where('status', '!=', 'scheduled')
            ->exists();

        if ($hasScheduledMatch) {
            return $this->forbidden('Cannot remove team from tournament while it has a scheduled match. Remove or reschedule the match first.');
        }

        if ($hasMatchAfterToss) {
            return $this->forbidden('Cannot remove team from tournament after toss has been done for a match involving this team.');
        }

        DB::transaction(function () use ($tournament, $team, $matchesInvolvingTeam) {
            $matchesInvolvingTeam->delete();
            $tournament->teams()->detach($team->id);
        });

        return $this->success(
            [
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
            ],
            'Team removed from tournament.',
            'SUCCESS'
        );
    }
}
