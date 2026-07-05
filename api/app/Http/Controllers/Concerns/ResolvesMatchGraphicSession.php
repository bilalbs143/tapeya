<?php

namespace App\Http\Controllers\Concerns;

use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\FindMatchGraphicSession;
use Illuminate\Http\JsonResponse;

/**
 * Shared graphic-session JSON for admin GET, user GET, and signed graphics read.
 */
trait ResolvesMatchGraphicSession
{
    /**
     * Return the session payload or 404 when graphics are not configured yet.
     */
    protected function matchGraphicSessionShowResponse(TournamentMatch $match): JsonResponse
    {
        $session = $this->requireMatchGraphicSession($match);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        return $this->successWithGraphicSession($session);
    }

    /**
     * Require an existing session or return 404.
     */
    protected function requireMatchGraphicSession(TournamentMatch $match): MatchGraphicSession|JsonResponse
    {
        $session = FindMatchGraphicSession::forMatch($match);

        if (! $session) {
            return $this->notFound('Graphic session not configured for this match.');
        }

        return $session;
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
