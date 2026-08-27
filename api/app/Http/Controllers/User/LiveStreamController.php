<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\LiveStreamResource;
use App\Models\LiveStream;
use Illuminate\Http\JsonResponse;

class LiveStreamController extends Controller
{
    use BaseControllerTrait;

    /**
     * Live and starting streams for the app hub (standalone + open-tournament match streams).
     */
    public function index(): JsonResponse
    {
        $streams = LiveStream::query()
            ->visibleInApp()
            ->with(['match.homeTeam', 'match.awayTeam', 'match.tournament', 'owner'])
            ->orderByRaw("CASE status WHEN 'live' THEN 0 WHEN 'starting' THEN 1 ELSE 2 END")
            ->orderByDesc('started_at')
            ->orderByDesc('id')
            ->get();

        return $this->success(LiveStreamResource::collection($streams));
    }

    /**
     * Single stream viewer payload keyed by stream id.
     */
    public function show(LiveStream $stream): JsonResponse
    {
        $stream->loadMissing(['match.homeTeam', 'match.awayTeam', 'match.tournament', 'owner']);

        return $this->success(new LiveStreamResource($stream));
    }
}
