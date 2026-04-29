<?php

namespace App\Http\Controllers\Admin;

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
     * List matches for a tournament (admin backoffice).
     */
    public function index(Tournament $tournament): JsonResponse
    {
        $query = $tournament->matches()
            ->with(['homeTeam', 'awayTeam', 'winningTeam', 'tossWinnerTeam'])
            ->orderBy('match_date')
            ->orderBy('match_time');

        $matches = request()->has('all')
            ? $query->get()
            : $query->paginate((int) request('per_page', 50));

        return TournamentMatchResource::collection($matches)->response();
    }

    /**
     * Schedule a fixture (same rules as app organizer).
     */
    public function store(StoreTournamentMatchRequest $request, Tournament $tournament): JsonResponse
    {
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

    public function show(TournamentMatch $match): JsonResponse
    {
        $match->load(['homeTeam', 'awayTeam', 'tournament', 'winningTeam', 'tossWinnerTeam']);

        return (new TournamentMatchResource($match))->response();
    }
}
