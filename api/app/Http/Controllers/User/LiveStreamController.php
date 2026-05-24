<?php

namespace App\Http\Controllers\User;

use App\Enums\Tournament\TournamentTypeEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\LiveStreamMatchResource;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class LiveStreamController extends Controller
{
    use BaseControllerTrait;

    /**
     * Matches with an active or starting YouTube stream (for home / live hub).
     */
    public function index(): JsonResponse
    {
        $table = (new TournamentMatch)->getTable();

        // Join match_streams for both filtering and deterministic ordering in one pass —
        // no correlated subquery needed.
        $matches = TournamentMatch::query()
            ->join('match_streams', 'match_streams.match_id', '=', "{$table}.id")
            ->whereIn('match_streams.status', ['live', 'starting'])
            ->whereHas(
                'tournament',
                fn ($query) => $query->where('tournament_type', TournamentTypeEnum::OPEN_TOURNAMENT)
            )
            ->with(['homeTeam', 'awayTeam', 'tournament', 'stream'])
            ->orderByRaw("CASE match_streams.status WHEN 'live' THEN 0 WHEN 'starting' THEN 1 ELSE 2 END")
            ->orderByDesc('match_streams.started_at')
            ->orderByDesc("{$table}.id")
            ->select("{$table}.*")
            ->get();

        return $this->success(LiveStreamMatchResource::collection($matches));
    }
}
