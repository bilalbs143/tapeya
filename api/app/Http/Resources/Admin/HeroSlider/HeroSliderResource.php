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
            'status' => $this->status?->label(),
            'status_enum' => $this->status?->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
