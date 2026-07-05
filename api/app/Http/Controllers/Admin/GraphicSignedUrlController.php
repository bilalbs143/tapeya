<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\Graphics\MatchGraphicSignedUrlService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Signed public graphics URLs for OBS / vMix browser sources.
 */
class GraphicSignedUrlController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    public function __construct(
        private readonly MatchGraphicSignedUrlService $signedUrlService,
    ) {}

    /**
     * Issue a new signed graphics URL and persist it on the session (invalidates any previous link).
     */
    public function signedUrl(TournamentMatch $match): JsonResponse
    {
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
}
