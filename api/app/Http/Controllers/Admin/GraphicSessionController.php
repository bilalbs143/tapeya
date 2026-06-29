<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Concerns\ResolvesMatchGraphicSession;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMatchGraphicSessionRequest;
use App\Http\Requests\Admin\UpdateMatchGraphicSessionRequest;
use App\Models\TournamentMatch;
use App\Services\Broadcast\CreateMatchGraphicSession;
use App\Services\Broadcast\FindMatchGraphicSession;
use App\Services\Overlay\MatchGraphicOverlayUrlService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Admin graphic session read, create (settings save), and theme/config updates.
 */
class GraphicSessionController extends Controller
{
    use BaseControllerTrait;
    use ResolvesMatchGraphicSession;

    public function __construct(
        private readonly CreateMatchGraphicSession $createMatchGraphicSession,
        private readonly MatchGraphicOverlayUrlService $overlayUrlService,
    ) {}

    /**
     * Read the graphic session for this match (404 when not configured).
     */
    public function show(TournamentMatch $match): JsonResponse
    {
        return $this->matchGraphicSessionShowResponse($match);
    }

    /**
     * Create the graphic session when a broadcaster saves settings for the first time.
     */
    public function store(StoreMatchGraphicSessionRequest $request, TournamentMatch $match): JsonResponse
    {
        if (FindMatchGraphicSession::forMatch($match)) {
            return $this->conflict('Graphic session already exists for this match. Use PATCH to update.');
        }

        $data = $request->validated();

        $session = $this->createMatchGraphicSession->create(
            $match,
            (int) $data['graphic_theme_id'],
            $data['config'],
            $request->user()?->id,
        );

        try {
            $this->overlayUrlService->resolve($session, refresh: true);
        } catch (RuntimeException) {
            // Session is created; overlay URL can be issued later from settings dialog.
        }

        return $this->successWithGraphicSession($session->fresh(), 'Graphic session created.', 'CREATED');
    }

    public function update(UpdateMatchGraphicSessionRequest $request, TournamentMatch $match): JsonResponse
    {
        $session = $this->requireMatchGraphicSession($match);
        if ($session instanceof JsonResponse) {
            return $session;
        }

        $data = $request->validated();
        $data['updated_by'] = $request->user()?->id;
        $session->update($data);

        return $this->successWithGraphicSession($session, 'Graphic session updated.');
    }
}
