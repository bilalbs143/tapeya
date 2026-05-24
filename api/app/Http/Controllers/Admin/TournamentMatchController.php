<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreTournamentMatchRequest;
use App\Http\Requests\User\UpdateTournamentMatchRequest;
use App\Http\Resources\User\TournamentMatchResource;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\Tournament\TournamentMatchSchedulingService;
use Illuminate\Http\JsonResponse;

class TournamentMatchController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        protected TournamentMatchSchedulingService $tournamentMatchSchedulingService,
    ) {}

    /**
     * List matches for a tournament (admin backoffice).
     */
    public function index(Tournament $tournament): JsonResponse
    {
        $query = $tournament->matches()
            ->with(['homeTeam', 'awayTeam', 'winningTeam', 'tossWinnerTeam', 'stream'])
            ->orderBy('match_date')
            ->orderBy('match_time');

        return $this->success(TournamentMatchResource::collection($this->paginateOrAll($query)));
    }

    /**
     * Schedule a new fixture.
     */
    public function store(StoreTournamentMatchRequest $request, Tournament $tournament): JsonResponse
    {
        $result = $this->tournamentMatchSchedulingService->schedule(
            $tournament,
            $request->validated(),
        );

        if (! $result['ok']) {
            return $result['reason'] === 'forbidden'
                ? $this->forbidden($result['message'])
                : $this->failure($result['message'], 'VALIDATION_ERROR');
        }

        $match = $result['match']->refresh()->load(['homeTeam', 'awayTeam', 'stream']);

        return $this->success(
            new TournamentMatchResource($match),
            'Match created.',
            'CREATED'
        );
    }

    public function show(TournamentMatch $match): JsonResponse
    {
        $match->load(['homeTeam', 'awayTeam', 'tournament', 'winningTeam', 'tossWinnerTeam', 'stream']);

        return $this->success(new TournamentMatchResource($match));
    }

    /**
     * Update a scheduled fixture (schedule fields and/or stream thumbnail).
     */
    public function update(UpdateTournamentMatchRequest $request, TournamentMatch $match): JsonResponse
    {
        $result = $this->tournamentMatchSchedulingService->update(
            $match,
            $request->validated(),
        );

        if (! $result['ok']) {
            return $result['reason'] === 'forbidden'
                ? $this->forbidden($result['message'])
                : $this->failure($result['message'], 'VALIDATION_ERROR');
        }

        $match = $result['match']->refresh()->load(['homeTeam', 'awayTeam', 'stream']);

        return $this->success(new TournamentMatchResource($match), 'Match updated.');
    }
}
