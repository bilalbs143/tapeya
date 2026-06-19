<?php

namespace App\Http\Controllers\User;

use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Jobs\SyncMatchGraphicContextJob;
use App\Models\TournamentMatch;
use App\Services\MatchStateService;
use App\Support\Scoring\MatchPendingState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Allows the scoring app to notify all broadcast subscribers (graphic overlay,
 * backoffice) which player will be at the crease or bowling next, BEFORE they
 * have faced or bowled their first ball.
 *
 * This is a scoring-domain endpoint — the caller deals with "who is on the
 * crease", not with graphic-session internals.  The broadcast side-effect is
 * an implementation detail owned by the API.
 *
 * PATCH /matches/{match}/crease
 * Body: any subset of { next_batter_id, next_non_striker_id, next_bowler_id }
 * Pass null for a key to explicitly clear that pending slot.
 * Omit a key to leave its existing value untouched.
 */
class MatchCreaseController extends Controller
{
    use BaseControllerTrait;

    public function update(
        Request $request,
        TournamentMatch $match,
        MatchStateService $matchStateService,
    ): JsonResponse {
        if (! $request->user()?->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot update the crease for this match.');
        }

        $data = $request->validate([
            'next_batter_id' => 'sometimes|nullable|integer|min:1',
            'next_non_striker_id' => 'sometimes|nullable|integer|min:1',
            'next_bowler_id' => 'sometimes|nullable|integer|min:1',
        ]);

        MatchPendingState::merge($match, $data);

        SyncMatchGraphicContextJob::dispatch($match->id);

        $matchState = $matchStateService->build($match->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(null, 'Crease updated.');
    }
}
