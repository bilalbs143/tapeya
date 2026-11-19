<?php

namespace App\Http\Resources\Admin\Ad;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdCreativeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'campaign_id' => $this->campaign_id,
            'post_id' => $this->post_id,
            'name' => $this->name,
            'headline' => $this->headline,
            'cta_label' => $this->cta_label,
            'cta_url' => $this->cta_url,
            'cta_type' => $this->cta_type?->value,
            'disclosure_label' => $this->disclosure_label,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'weight' => (int) $this->weight,
            'reviewed_by_admin_id' => $this->reviewed_by_admin_id,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'campaign' => $this->whenLoaded('campaign', fn () => new AdCampaignResource($this->campaign)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
