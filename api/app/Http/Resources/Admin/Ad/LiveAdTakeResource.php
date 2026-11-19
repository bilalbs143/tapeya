<?php

namespace App\Http\Resources\Admin\Ad;

use App\Events\Broadcast\LiveAdTakeStarted;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveAdTakeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'creative_id' => $this->creative_id,
            'campaign_id' => $this->campaign_id,
            'mode' => $this->mode?->value,
            'mode_label' => $this->mode?->label(),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'presentation_json' => $this->presentation_json,
            'note' => $this->note,
            'started_by_admin_id' => $this->started_by_admin_id,
            'ended_by_admin_id' => $this->ended_by_admin_id,
            'started_at' => $this->started_at?->toIso8601String(),
            'ended_at' => $this->ended_at?->toIso8601String(),
            'stream_ids' => $this->whenLoaded('streams', fn () => $this->streams->pluck('id')->values()->all()),
            'streams' => $this->whenLoaded('streams', fn () => $this->streams->map(fn ($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'status' => $s->status,
            ])->values()->all()),
            'creative' => $this->whenLoaded('creative', fn () => $this->creative ? [
                'id' => $this->creative->id,
                'name' => $this->creative->name,
                'status' => $this->creative->status?->value,
                'campaign_id' => $this->creative->campaign_id,
            ] : null),
            'take' => LiveAdTakeStarted::payload($this->resource),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
