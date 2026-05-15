<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\TournamentMatch;
use App\Services\Broadcast\BuildMatchGraphicContextService;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchGraphicSessionController extends Controller
{
    use BaseControllerTrait;

    /**
     * Get or create the graphic session for this match (same payload as admin GET).
     *
     * Used by the broadcast overlay app with a user API token.
     */
    public function show(TournamentMatch $match): JsonResponse
    {
        $session = ResolveMatchGraphicSession::forMatch($match);
        $session->load([
            'theme',
            'activeCommand',
            'commands' => fn ($q) => $q->limit(30),
        ]);

        return $this->success(new MatchGraphicSessionResource($session));
    }

    /**
     * Record the next batsman and/or bowler selected in the scoring app before
     * any ball has been bowled, so the graphic overlay shows them immediately
     * instead of showing a blank slot.
     *
     * Body: { next_batter_id?: int, next_non_striker_id?: int, next_bowler_id?: int }
     * Omit a key to leave its existing pending value untouched.
     * Pass null to explicitly clear a specific field.
     */
    public function setPendingPlayers(Request $request, TournamentMatch $match, BuildMatchGraphicContextService $service): JsonResponse
    {
        $data = $request->validate([
            'next_batter_id' => 'sometimes|nullable|integer|min:1',
            'next_non_striker_id' => 'sometimes|nullable|integer|min:1',
            'next_bowler_id' => 'sometimes|nullable|integer|min:1',
        ]);

        $service->setPendingAndBroadcast($match, $data);

        return $this->success(null, 'Pending players updated.');
    }
}
