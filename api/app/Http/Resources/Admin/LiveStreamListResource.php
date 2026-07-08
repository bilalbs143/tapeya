<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveStreamListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->displayTitle(),
            'description' => $this->displayDescription(),
            'streaming_url' => $this->streaming_url,
            'status' => $this->status,
            'provider' => $this->provider,
            'started_at' => $this->started_at?->toIso8601String(),
            'match_id' => $this->match_id,
            'owner_user_id' => $this->owner_user_id,
            'watching_count' => (int) ($this->watching_count ?? 0),
        ];
    }
}
