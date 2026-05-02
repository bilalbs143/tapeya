<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTournamentMatchRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\Tournament\TournamentMatchSchedulingService;
use Illuminate\Http\JsonResponse;

class TournamentMatchController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        protected TournamentMatchSchedulingService $tournamentMatchSchedulingService
    ) {}

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

        return $this->success(TournamentMatchResource::collection($this->paginateOrAll($query)));
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

        if (! $authUser->canOperateTournamentInApp($tournament)) {
            return $this->forbidden('You cannot manage matches for this tournament.');
        }

        $result = $this->tournamentMatchSchedulingService->schedule($tournament, $request->validated());

        if (! $result['ok']) {
            return $result['reason'] === 'forbidden'
                ? $this->forbidden($result['message'])
                : $this->failure($result['message'], 'VALIDATION_ERROR');
        }

        return $this->success(
            new TournamentMatchResource($result['match']),
            'Match created.',
            'CREATED'
        );
    }
}
