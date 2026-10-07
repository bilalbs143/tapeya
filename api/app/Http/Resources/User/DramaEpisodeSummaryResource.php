<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DramaEpisodeSummaryResource extends JsonResource
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
            'duration' => $this->duration,
            'views_count' => (int) $this->views_count,
            'likes_count' => (int) $this->likes_count,
            'comments_count' => (int) $this->comments_count,
        ];
    }
}
