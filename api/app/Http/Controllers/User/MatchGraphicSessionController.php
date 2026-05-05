<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\TournamentMatch;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use Illuminate\Http\JsonResponse;

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
}
