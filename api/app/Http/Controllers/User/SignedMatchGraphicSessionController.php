<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use App\Services\Overlay\GraphicOverlaySigner;
use App\Settings\OverlaySettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SignedMatchGraphicSessionController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    public function __construct(private readonly OverlaySettings $overlaySettings) {}

    /**
     * Public read of graphic session when ?expires=&signature= validate (OBS overlay).
     */
    public function show(Request $request, TournamentMatch $match): JsonResponse
    {
        $expiresRaw = $request->query('expires');
        $signature = (string) $request->query('signature', '');

        if (! is_numeric($expiresRaw) || $signature === '') {
            return $this->failure('Missing or invalid expires / signature.', 'VALIDATION_ERROR');
        }

        $expires = (int) $expiresRaw;
        $signer = GraphicOverlaySigner::fromSettings($this->overlaySettings);

        if (! $signer->verify((int) $match->id, $expires, $signature)) {
            return $this->failure('Invalid or expired overlay link.', 'FORBIDDEN');
        }

        $session = ResolveMatchGraphicSession::forMatch($match);

        return $this->successWithGraphicSession($session);
    }
}
