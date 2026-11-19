<?php

namespace App\Http\Resources\Admin\Ad;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdCampaignResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'brand_partner_id' => $this->brand_partner_id,
            'name' => $this->name,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'objective' => $this->objective?->value,
            'objective_label' => $this->objective?->label(),
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'priority' => (int) $this->priority,
            'surfaces' => $this->surfaces ?? [],
            'slot_every_n' => (int) $this->slot_every_n,
            'max_ads_per_response' => (int) $this->max_ads_per_response,
            'targeting_json' => $this->targeting_json,
            'budget_notes' => $this->budget_notes,
            'created_by_admin_id' => $this->created_by_admin_id,
            'brand_partner' => $this->whenLoaded('brandPartner', fn () => new BrandPartnerResource($this->brandPartner)),
            'creatives_count' => $this->whenCounted('creatives'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
