<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DramaEpisodeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'serial_id' => $this->drama_serial_id,
            'episode_number' => (int) $this->episode_number,
            'title' => $this->title,
            'description' => $this->description,
            'thumbnail' => $this->thumbnailUrl(),
            'video_source' => $this->video_source?->value ?? 'youtube',
            'video_url' => $this->resolvedVideoUrl(),
            'duration' => $this->duration,
            'views_count' => (int) $this->views_count,
            'likes_count' => (int) $this->likes_count,
            'dislikes_count' => (int) ($this->dislikes_count ?? 0),
            'comments_count' => (int) $this->comments_count,
            'shares_count' => (int) ($this->shares_count ?? 0),
            'my_reaction' => $this->my_reaction instanceof \BackedEnum
                ? $this->my_reaction->value
                : ($this->my_reaction ?? null),
            'serial' => $this->whenLoaded('serial', fn () => $this->serial ? [
                'id' => $this->serial->id,
                'title' => $this->serial->title,
                'poster' => $this->serial->posterUrl(),
            ] : null),
            'prev_episode_id' => $this->when(isset($this->prev_episode_id), fn () => $this->prev_episode_id),
            'next_episode_id' => $this->when(isset($this->next_episode_id), fn () => $this->next_episode_id),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
