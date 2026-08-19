<?php

namespace App\Http\Resources\User;

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
            'cta_label' => $this->cta_label,
            'cta_url' => $this->cta_url,
            'cta_target_blank' => (bool) $this->cta_target_blank,
            'cta_dialog_key' => $this->cta_dialog_key,
            'cta_dialog_param' => $this->cta_dialog_param,
        ];
    }
}
