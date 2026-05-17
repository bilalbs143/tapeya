<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateMatchGraphicSessionRequest;
use App\Models\GraphicTheme;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use App\Services\Broadcast\ResolveMatchGraphicSession;
use Illuminate\Http\JsonResponse;

/**
 * Admin graphic session read and theme/config updates.
 */
class GraphicSessionController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    /**
     * Get or create the graphic session for this match.
     */
    public function show(TournamentMatch $match): JsonResponse
    {
        return $this->matchGraphicSessionShowResponse($match);
    }

    public function update(UpdateMatchGraphicSessionRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = $match->graphicSession ?? $this->resolveOrCreateSession($match);

        $data = $request->validated();
        if (isset($data['graphic_theme_id'])) {
            $theme = GraphicTheme::query()->whereKey($data['graphic_theme_id'])->where('is_active', true)->first();
            if (! $theme) {
                return $this->failure('Theme not found or inactive.', 'VALIDATION_ERROR');
            }
        }
        $data['updated_by'] = $request->user()?->id;
        $session->update($data);

        return $this->successWithGraphicSession($session, 'Graphic session updated.');
    }

    private function resolveOrCreateSession(TournamentMatch $match): MatchGraphicSession
    {
        return ResolveMatchGraphicSession::forMatch($match);
    }
}
