<?php

namespace App\Http\Resources\Admin;

use App\Enums\Drama\DramaVideoSourceEnum;
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
            'drama_serial_id' => $this->drama_serial_id,
            'serial' => $this->whenLoaded('serial', fn () => $this->serial ? [
                'id' => $this->serial->id,
                'title' => $this->serial->title,
            ] : null),
            'episode_number' => (int) $this->episode_number,
            'title' => $this->title,
            'description' => $this->description,
            'thumbnail' => $this->thumbnailUrl(),
            'video_source' => $this->video_source?->value ?? DramaVideoSourceEnum::YOUTUBE->value,
            'video' => $this->resolvedVideoUrl(),
            'duration' => $this->duration,
            'is_active' => $this->is_active,
            'views_count' => (int) $this->views_count,
            'likes_count' => (int) $this->likes_count,
            'dislikes_count' => (int) ($this->dislikes_count ?? 0),
            'comments_count' => (int) $this->comments_count,
            'shares_count' => (int) ($this->shares_count ?? 0),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
