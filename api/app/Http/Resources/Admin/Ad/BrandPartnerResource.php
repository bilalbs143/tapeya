<?php

namespace App\Http\Resources\Admin\Ad;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandPartnerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_path' => $this->logo_path,
            'logo_url' => MediaDisk::url($this->logo_path),
            'user_id' => $this->user_id,
            'shop_brand_id' => $this->shop_brand_id,
            'contact_email' => $this->contact_email,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
                'phone' => $this->user?->phone,
                'nickname' => $this->user?->nickname,
                'is_official' => (bool) $this->user?->is_official,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
