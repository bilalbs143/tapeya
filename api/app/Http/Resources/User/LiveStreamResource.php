<?php

namespace App\Http\Resources\User;

use App\Models\LiveStream;
use App\Services\Ad\AdEligibilityService;
use App\Services\Ad\LiveAdTakeService;
use App\Support\Ad\LiveAdTakeViewerPayload;
use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveStreamResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $stream = $this->resource;
        $canWatch = $request->user('api') !== null;
        // Only on single-stream show (avoid N+1 on hub index). Guests get null (no creative leak).
        $onStreamShow = $this->shouldIncludeActiveTake($request, $stream);

        $activeTake = null;
        if ($onStreamShow && $canWatch && app(AdEligibilityService::class)->adsEnabled()) {
            $take = app(LiveAdTakeService::class)->activeTakeForStream((int) $stream->id);
            $activeTake = $take ? LiveAdTakeViewerPayload::fromTake($take) : null;
        }

        return [
            'id' => $stream->id,
            'match_id' => $stream->match_id,
            'tournament_id' => $stream->match?->tournament_id,
            'is_self_serve' => $stream->isSelfServe(),
            'orientation' => $stream->resolvedOrientation(),
            'title' => $stream->displayTitle(),
            'description' => $stream->displayDescription(),
            // Guests get the teaser (title + thumbnail) only — playback requires login.
            'streaming_url' => $this->when($canWatch, $stream->streaming_url),
            'thumbnail_url' => $stream->thumbnailUrl(),
            'ads_allowed' => (bool) ($stream->ads_allowed ?? true),
            'broadcaster' => $this->when(
                $stream->isSelfServe() && $stream->relationLoaded('owner') && $stream->owner,
                fn () => [
                    'id' => $stream->owner->id,
                    'name' => $stream->owner->name,
                    'nickname' => $stream->owner->nickname,
                    'avatar_url' => MediaDisk::url($stream->owner->avatar),
                    'is_official' => (bool) $stream->owner->is_official,
                ],
            ),
            'active_take' => $this->when($onStreamShow, $activeTake),
            'stream' => [
                'status' => $stream->status,
                'provider' => $this->when($canWatch, $stream->provider),
                'embed_id' => $this->when($canWatch, $stream->provider_playback_id),
                'playback' => $this->when(
                    $canWatch && in_array($stream->status, ['live', 'ended'], true),
                    fn () => $stream->playbackForApp(),
                ),
                'started_at' => $stream->started_at?->toIso8601String(),
                'ended_at' => $stream->ended_at?->toIso8601String(),
            ],
        ];
    }

    private function shouldIncludeActiveTake(Request $request, mixed $stream): bool
    {
        $routeStream = $request->route('stream');
        if ($routeStream instanceof LiveStream) {
            return (int) $routeStream->id === (int) $stream->id;
        }
        if (is_numeric($routeStream)) {
            return (int) $routeStream === (int) $stream->id;
        }

        // Explicit opt-in (LiveHubUpdated single-row pushes, tests).
        return (bool) ($stream->include_active_take ?? false);
    }
}
