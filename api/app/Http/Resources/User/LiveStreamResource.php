<?php

namespace App\Http\Resources\User;

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

        return [
            'id' => $stream->id,
            'match_id' => $stream->match_id,
            'tournament_id' => $stream->match?->tournament_id,
            'is_self_serve' => $stream->isSelfServe(),
            'orientation' => $stream->resolvedOrientation(),
            'title' => $stream->displayTitle(),
            'description' => $stream->displayDescription(),
            'streaming_url' => $stream->streaming_url,
            'thumbnail_url' => $stream->thumbnailUrl(),
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
            'stream' => [
                'status' => $stream->status,
                'provider' => $stream->provider,
                'embed_id' => $stream->provider_playback_id,
                'playback' => $this->when(
                    in_array($stream->status, ['live', 'ended'], true),
                    fn () => $stream->playbackForApp(),
                ),
                'started_at' => $stream->started_at?->toIso8601String(),
                'ended_at' => $stream->ended_at?->toIso8601String(),
            ],
        ];
    }
}
