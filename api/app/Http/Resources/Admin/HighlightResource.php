<?php

namespace App\Http\Resources\Admin;

use App\Enums\Highlight\HighlightVideoSourceEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HighlightResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'thumbnail' => $this->thumbnailUrl(),
            'video_source' => $this->video_source?->value ?? HighlightVideoSourceEnum::YOUTUBE->value,
            'video' => $this->resolvedVideoUrl(),
            'duration' => $this->duration,
            'tournament_id' => $this->tournament_id,
            'tournament' => $this->whenLoaded('tournament', fn () => $this->tournament ? [
                'id' => $this->tournament->id,
                'tournament_name' => $this->tournament->tournament_name,
            ] : null),
            'is_active' => $this->is_active,
            'views_count' => (int) $this->views_count,
            'likes_count' => (int) $this->likes_count,
            'dislikes_count' => (int) $this->dislikes_count,
            'shares_count' => (int) $this->shares_count,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
