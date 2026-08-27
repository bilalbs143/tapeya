<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpsertMatchGraphicSessionRequest;
use App\Models\TournamentMatch;
use App\Services\Broadcast\StartUserOwnedGraphicOverlay;
use App\Services\Graphics\MatchGraphicSignedUrlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * App broadcast setup: theme picker creates a graphic session with LT_DEFAULT + overlay URL.
 */
class MatchGraphicSessionController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    public function __construct(
        private readonly StartUserOwnedGraphicOverlay $startUserOwnedGraphicOverlay,
        private readonly MatchGraphicSignedUrlService $signedUrlService,
    ) {}

    /**
     * Read the graphic session (404 when not configured). Scorer / organizer only.
     */
    public function show(Request $request, TournamentMatch $match): JsonResponse
    {
        if ($denied = $this->forbidUnlessScorer($request, $match)) {
            return $denied;
        }

        return $this->matchGraphicSessionShowResponse($match);
    }

    /**
     * Create or update the session from a theme pick. Activates LT_DEFAULT and issues
     * a signed overlay URL if the session does not already have one.
     */
    public function upsert(UpsertMatchGraphicSessionRequest $request, TournamentMatch $match): JsonResponse
    {
        if ($denied = $this->forbidUnlessScorer($request, $match)) {
            return $denied;
        }

        $data = $request->validated();

        $session = $this->startUserOwnedGraphicOverlay->start(
            $match,
            (int) $data['graphic_theme_id'],
            $request->user()?->id,
            $data['config'] ?? null,
        );

        return $this->successWithGraphicSession($session, 'Graphic session ready.');
    }

    /**
     * Issue a new signed graphics URL (invalidates the previous OBS link).
     */
    public function signedUrl(Request $request, TournamentMatch $match): JsonResponse
    {
        if ($denied = $this->forbidUnlessScorer($request, $match)) {
            return $denied;
        }

        $session = $this->requireMatchGraphicSession($match);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        try {
            $payload = $this->signedUrlService->resolve($session);
        } catch (RuntimeException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success($payload)->header('Cache-Control', 'no-store, private');
    }

    private function forbidUnlessScorer(Request $request, TournamentMatch $match): ?JsonResponse
    {
        if (! $request->user()?->canScoreMatchInApp($match)) {
            return $this->forbidden('You cannot set up broadcast graphics for this match.');
        }

        return null;
    }
}
