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
     */
    public function index(Tournament $tournament): JsonResponse
    {
        $matches = $tournament->matches()
            ->with(['homeTeam', 'awayTeam', 'winningTeam'])
            ->orderBy('match_date')
            ->orderBy('match_time')
            ->paginate(request('per_page', 15));

        return $this->success(TournamentMatchResource::collection($matches));
    }

    /**
     * Show a single match.
     */
    public function show(TournamentMatch $match): JsonResponse
    {
        $match->load(['homeTeam', 'awayTeam', 'winningTeam', 'tournament']);

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

        $match = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'home_team_id' => $data['home_team_id'],
            'away_team_id' => $data['away_team_id'],
            'match_date' => $data['match_date'],
            'match_time' => $data['match_time'],
            'venue_name' => $data['venue_name'],
            'players_per_side' => $data['players_per_side'],
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
