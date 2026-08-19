<?php

namespace App\Http\Resources\Admin\HeroSlider;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HeroSliderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'image_mobile' => $this->image_mobile,
            'image_desktop' => $this->image_desktop,
            'cta_type' => $this->cta_type?->value ?? 'none',
            'cta_type_label' => $this->cta_type?->label() ?? 'Image Only',
            'cta_label' => $this->cta_label,
            'cta_url' => $this->cta_url,
            'cta_target_blank' => (bool) $this->cta_target_blank,
            'cta_dialog_key' => $this->cta_dialog_key,
            'cta_dialog_param' => $this->cta_dialog_param,
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
