<?php

namespace App\Http\Controllers\User;

use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicContextOrchestrator;
use App\Services\MatchStateService;
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
        GraphicContextOrchestrator $orchestrator,
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

        $orchestrator->setPendingAndBroadcast($match, $data);

        // Also broadcast the full match state so the backoffice, graphic
        // controller, and real-time scorecard receive opener / bowler
        // assignments before the first ball is recorded.
        $matchState = $matchStateService->build($match->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(null, 'Crease updated.');
    }
}
