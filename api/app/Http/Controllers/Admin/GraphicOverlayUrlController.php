<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\Overlay\MatchGraphicOverlayUrlService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Signed public overlay URLs for OBS / vMix browser sources.
 */
class GraphicOverlayUrlController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    public function __construct(
        private readonly MatchGraphicOverlayUrlService $overlayUrlService,
    ) {}

    /**
     * Issue a new signed overlay URL and persist it on the session (invalidates any previous link).
     */
    public function signedOverlayUrl(TournamentMatch $match): JsonResponse
    {
        $session = $this->requireMatchGraphicSession($match);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        try {
            $payload = $this->overlayUrlService->resolve($session);
        } catch (RuntimeException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success($payload)->header('Cache-Control', 'no-store, private');
    }
}
