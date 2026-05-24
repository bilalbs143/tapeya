<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveStreamMatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $match = $this->resource;
        $stream = $match->stream;

        return [
            'id' => $match->id,
            'tournament_id' => $match->tournament_id,
            'status' => $match->status?->value,
            'home_team' => $this->whenLoaded('homeTeam', fn () => new TeamResource($match->homeTeam)),
            'away_team' => $this->whenLoaded('awayTeam', fn () => new TeamResource($match->awayTeam)),
            'tournament' => $this->whenLoaded('tournament', fn () => [
                'id' => $match->tournament->id,
                'name' => $match->tournament->tournament_name ?? '',
            ]),
            'thumbnail_url' => $match->streamThumbnailUrl(),
            // stream is guaranteed non-null by the controller query, but guard defensively.
            'stream' => $stream ? [
                'status' => $stream->status,
                'embed_id' => $stream->provider_playback_id,
            ] : null,
        ];
    }
}
