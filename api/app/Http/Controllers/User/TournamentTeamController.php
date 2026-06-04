<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\AttachTeamsToTournamentRequest;
use App\Http\Requests\User\UpdateTournamentTeamRequest;
use App\Http\Resources\User\TeamResource;
use App\Models\Team;
use App\Models\Tournament;
use App\Services\Tournament\TournamentTeamSquadValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TournamentTeamController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly TournamentTeamSquadValidator $squadValidator,
    ) {}

    /**
     * List teams attached to a tournament.
     * GET /tournaments/{tournament}/teams
     * Each team includes group_index from the tournament_team pivot when tournament has groups.
     */
    public function index(Tournament $tournament): JsonResponse
    {
        $teams = $tournament->teams()
            ->with(['sponsor', 'iconPlayers'])
            ->orderBy('name')
            ->get();

        return $this->success(TeamResource::collection($teams));
    }

    /**
     * Players already rostered on other teams in this tournament (for squad pickers).
     * GET /tournaments/{tournament}/squad-occupancy?exclude_team_id=
     */
    public function squadOccupancy(Tournament $tournament): JsonResponse
    {
        $excludeTeamId = request()->integer('exclude_team_id') ?: null;

        return $this->success(
            $this->squadValidator->tournamentOccupancy($tournament, $excludeTeamId),
        );
    }

    /**
     * Attach one or more teams to a tournament.
     *
     * Follows the docs: teams are created independently, then added to a tournament.
     * Only organizers can attach teams to tournaments.
     */
    public function store(AttachTeamsToTournamentRequest $request, Tournament $tournament): JsonResponse
    {
        $user = $request->user();

        if (! $user->canOperateTournamentInApp($tournament)) {
            return $this->forbidden('You cannot manage teams for this tournament.');
        }

        $teamIds = $request->validated('team_ids');
        $groupIndex = $request->validated('group_index');

        $alreadyAttached = $tournament->teams()->pluck('teams.id')->all();
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
            return $this->failure('Group index is required and must be between 1 and '.$tournament->number_of_groups.' for this tournament.', 'VALIDATION_ERROR');
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
     * Update a team's group in the tournament (organizer only).
     * PATCH /tournaments/{tournament}/teams/{team}
     */
    public function update(UpdateTournamentTeamRequest $request, Tournament $tournament, Team $team): JsonResponse
    {
        if (! $request->user()->canOperateTournamentInApp($tournament)) {
            return $this->forbidden('You cannot manage teams for this tournament.');
        }

        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        if ($tournament->number_of_groups <= 1) {
            return $this->failure('This tournament does not use groups.', 'VALIDATION_ERROR');
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
     * Remove a team from a tournament.
     *
     * Only the tournament organizer can remove a team.
     * Team cannot be removed if it is involved in any match where toss has been done.
     * Cascade: scheduled matches involving this team are deleted (match squads, players, innings, balls).
     * DELETE /tournaments/{tournament}/teams/{team}
     */
    public function destroy(Tournament $tournament, Team $team): JsonResponse
    {
        $user = request()->user();

        if (! $user->canOperateTournamentInApp($tournament)) {
            return $this->forbidden('You cannot manage teams for this tournament.');
        }

        if (! $tournament->teams()->where('teams.id', $team->id)->exists()) {
            return $this->failure('Team is not attached to this tournament.', 'NOT_FOUND');
        }

        $matchesInvolvingTeam = $tournament->matches()
            ->where(function ($q) use ($team) {
                $q->where('home_team_id', $team->id)
                    ->orWhere('away_team_id', $team->id);
            });

        // Do not allow removal if the team has a scheduled match; also not after toss
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
