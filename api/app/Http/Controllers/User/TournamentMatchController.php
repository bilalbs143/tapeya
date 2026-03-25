<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTournamentMatchRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class TournamentMatchController extends Controller
{
    use BaseControllerTrait;

    /**
     * List matches for a tournament.
     * Query: all=1 to return all matches (no pagination); otherwise paginate with per_page.
     */
    public function index(Tournament $tournament): JsonResponse
    {
        $query = $tournament->matches()
            ->with(['homeTeam', 'awayTeam', 'winningTeam', 'tossWinnerTeam'])
            ->orderBy('match_date')
            ->orderBy('match_time');

        $matches = request()->has('all')
            ? $query->get()
            : $query->paginate((int) request('per_page', 15));

        return $this->success(TournamentMatchResource::collection($matches));
    }

    /**
     * Show a single match.
     */
    public function show(TournamentMatch $match): JsonResponse
    {
        $match->load(['homeTeam', 'awayTeam', 'winningTeam', 'tossWinnerTeam', 'tournament']);

        return $this->success(new TournamentMatchResource($match));
    }

    /**
     * Create a match/fixture for a tournament (schedule).
     *
     * Only organizers can create matches. Teams must already be attached to the tournament.
     */
    public function store(StoreTournamentMatchRequest $request, Tournament $tournament): JsonResponse
    {
        $authUser = $request->user();

        if ($tournament->organizer_id !== $authUser->id) {
            return $this->forbidden('Only the tournament organizer can create matches.');
        }

        $data = $request->validated();

        // Ensure both teams belong to this tournament (via tournament-team pivot).
        $teamIds = [$data['home_team_id'], $data['away_team_id']];
        $attachedCount = $tournament->teams()
            ->whereIn('teams.id', $teamIds)
            ->count();

        if ($attachedCount !== 2) {
            return $this->forbidden('Both teams must be attached to this tournament before scheduling a match.');
        }

        $groupIndex = isset($data['group_index']) ? (int) $data['group_index'] : null;
        if ($groupIndex !== null) {
            if ($tournament->number_of_groups < 1 || $groupIndex < 1 || $groupIndex > $tournament->number_of_groups) {
                return $this->failure('Group Index must be between 1 and '.$tournament->number_of_groups.' for this tournament.', 'VALIDATION_ERROR', 422);
            }
            $inGroup = $tournament->teams()
                ->whereIn('teams.id', $teamIds)
                ->wherePivot('group_index', $groupIndex)
                ->count();
            if ($inGroup !== 2) {
                return $this->failure('Both teams must belong to group '.$groupIndex.' for this group-stage match.', 'VALIDATION_ERROR', 422);
            }
        }

        $match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'group_index' => $groupIndex,
            'home_team_id' => $data['home_team_id'],
            'away_team_id' => $data['away_team_id'],
            'match_date' => $data['match_date'],
            'match_time' => $data['match_time'],
            'venue_name' => $data['venue_name'],
            'players_per_side' => $data['players_per_side'],
            'overs' => $data['overs'],
            'status' => 'scheduled',
        ]);

        $match->load(['homeTeam', 'awayTeam']);

        return $this->success(
            new TournamentMatchResource($match),
            'Match created.',
            'CREATED'
        );
    }
}
