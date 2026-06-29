<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\Overlay\MatchGraphicOverlayUrlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
     * Return the session's signed overlay URL. Generates once, then reuses until ?refresh=1.
     */
    public function signedOverlayUrl(Request $request, TournamentMatch $match): JsonResponse
    {
        $session = $this->requireMatchGraphicSession($match);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $refresh = $request->boolean('refresh');

        try {
            $payload = $this->overlayUrlService->resolve($session, $refresh);
        } catch (RuntimeException $e) {
            return $this->failure($e->getMessage(), 'VALIDATION_ERROR');
        }

        return $this->success($payload);
    }
}
