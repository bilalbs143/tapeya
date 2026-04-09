<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\TournamentMatchResource;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class TournamentMatchController extends Controller
{
    use BaseControllerTrait;

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

    public function show(TournamentMatch $match): JsonResponse
    {
        $match->load(['homeTeam', 'awayTeam', 'tournament', 'winningTeam', 'tossWinnerTeam']);

        return (new TournamentMatchResource($match))->response();
    }
}
