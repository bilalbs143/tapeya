<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\MatchGraphicSessionResource;
use App\Models\TournamentMatch;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use App\Services\Overlay\MatchGraphicOverlaySigner;
use App\Settings\OverlaySettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SignedMatchGraphicSessionController extends Controller
{
    use BaseControllerTrait;

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
        $signer = MatchGraphicOverlaySigner::fromSettings($this->overlaySettings);

        if (! $signer->verify((int) $match->id, $expires, $signature)) {
            return $this->failure('Invalid or expired overlay link.', 'FORBIDDEN');
        }

        $session = ResolveMatchGraphicSession::forMatch($match);
        $session->load([
            'theme',
            'activeCommand',
            'commands' => fn ($q) => $q->limit(30),
        ]);

        return $this->success(new MatchGraphicSessionResource($session));
    }
}
