<?php

namespace App\Http\Controllers\Concerns;

use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use Illuminate\Http\JsonResponse;

/**
 * Shared graphic-session JSON for admin GET, user GET, and signed overlay read.
 */
trait ResolvesMatchGraphicSession
{
    /**
     * Resolve or create the graphic session and return the standard session payload.
     */
    protected function matchGraphicSessionShowResponse(TournamentMatch $match): JsonResponse
    {
        $session = ResolveMatchGraphicSession::forMatch($match);

        return $this->successWithGraphicSession($session);
    }

    /**
     * Eager-load relations and wrap in {@see MatchGraphicSessionResource}.
     */
    protected function successWithGraphicSession(MatchGraphicSession $session, ?string $message = null): JsonResponse
    {
        $session->load([
            'theme',
            'activeCommand',
            'commands' => fn ($q) => $q->limit(30),
        ]);

        return $this->success(new MatchGraphicSessionResource($session), $message);
    }
}
