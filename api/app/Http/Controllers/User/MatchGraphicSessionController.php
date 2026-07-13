<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use Illuminate\Http\JsonResponse;

class MatchGraphicSessionController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    /**
     * Get or create the graphic session for this match (same payload as admin GET).
     *
     * Used by the graphics app with a user API token.
     */
    public function show(TournamentMatch $match): JsonResponse
    {
        return $this->matchGraphicSessionShowResponse($match);
    }
}
