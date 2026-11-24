<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\LiveStreamResource;
use App\Models\LiveStream;
use App\Services\Ad\AdEligibilityService;
use App\Services\Ad\LiveAdTakeService;
use App\Support\Ad\LiveAdTakeViewerPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveStreamController extends Controller
{
    use BaseControllerTrait;

    public function __construct(
        private readonly LiveAdTakeService $liveAdTakes,
        private readonly AdEligibilityService $ads,
    ) {}

    /**
     * Live hub listing — on-air streams only (standalone + open-tournament match streams).
     */
    public function index(): JsonResponse
    {
        $streams = LiveStream::query()
            ->visibleInApp()
            ->with(['match.homeTeam', 'match.awayTeam', 'match.tournament', 'owner'])
            ->orderByDesc('started_at')
            ->orderByDesc('id')
            ->get();

        return $this->success(LiveStreamResource::collection($streams));
    }

    /**
     * Single stream viewer payload keyed by stream id.
     *
     * Public for share / deep links (title + thumbnail teaser). Guests may only open
     * live, starting, or ended streams. Playback fields require auth (see resource).
     * Authenticated watchers get `active_take` (or null) for mid-take join / reconnect.
     */
    public function show(Request $request, LiveStream $stream): JsonResponse
    {
        if (! $request->user('api') && ! in_array($stream->status, ['live', 'starting', 'ended'], true)) {
            abort(404);
        }

        $stream->loadMissing(['match.homeTeam', 'match.awayTeam', 'match.tournament', 'owner']);

        return $this->success(new LiveStreamResource($stream));
    }

    /**
     * Lightweight active take for watch reconnect without reloading the full stream.
     * Auth required — same visibility as playback fields.
     */
    public function activeTake(Request $request, LiveStream $stream): JsonResponse
    {
        if (! $request->user('api')) {
            abort(401);
        }

        if (! in_array($stream->status, ['live', 'starting', 'ended'], true)) {
            abort(404);
        }

        if (! $this->ads->adsEnabled()) {
            return $this->success(['active_take' => null]);
        }

        $take = $this->liveAdTakes->activeTakeForStream((int) $stream->id);

        return $this->success([
            'active_take' => $take ? LiveAdTakeViewerPayload::fromTake($take) : null,
        ]);
    }
}
