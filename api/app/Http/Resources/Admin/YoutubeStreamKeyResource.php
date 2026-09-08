<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * List shape — no RTMP credentials. Ingest is only returned from store()/show().
 */
class YoutubeStreamKeyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $activeSession = $this->activeSession();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'in_use' => $activeSession !== null,
            'in_use_by' => $activeSession ? [
                'id' => $activeSession->id,
                'title' => $activeSession->displayTitle(),
                'status' => $activeSession->status,
            ] : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
