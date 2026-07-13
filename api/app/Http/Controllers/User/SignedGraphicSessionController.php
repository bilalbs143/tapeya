<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Models\MatchGraphicSession;
use App\Services\Graphics\GraphicAccessSigner;
use App\Services\Graphics\MatchGraphicSignedUrlService;
use App\Settings\GraphicsSettings;
use Illuminate\Http\JsonResponse;

class SignedGraphicSessionController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    public function __construct(
        private readonly GraphicsSettings $graphicsSettings,
        private readonly MatchGraphicSignedUrlService $signedUrlService,
    ) {}

    /**
     * Public read of a graphic session when the access token validates (OBS / vMix graphics source).
     * Token format: {sessionId}-{expiresUnix}-{signatureHex}
     */
    public function showByToken(string $token): JsonResponse
    {
        $signer = GraphicAccessSigner::fromSettings($this->graphicsSettings);
        $parsed = $signer->verifyToken($token);

        if ($parsed === null) {
            return $this->failure('Invalid or expired graphics link.', 'FORBIDDEN');
        }

        $graphicSession = MatchGraphicSession::query()->find($parsed['sessionId']);
        if ($graphicSession === null) {
            return $this->failure('Invalid or expired graphics link.', 'FORBIDDEN');
        }

        if (! $this->signedUrlService->isCurrentLink($graphicSession, $parsed['expires'])) {
            return $this->failure(
                'This graphics link has been superseded. Request a new URL from the controller.',
                'FORBIDDEN',
            );
        }

        return $this->successWithGraphicSession($graphicSession);
    }
}
