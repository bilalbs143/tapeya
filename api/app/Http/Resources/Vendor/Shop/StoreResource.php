<?php

namespace App\Http\Resources\Vendor\Shop;

use App\Support\Media\MediaDisk;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_name' => $this->store_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => MediaDisk::url($this->logo),
            'banner' => MediaDisk::url($this->banner),
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'commission_rate' => $this->commission_rate !== null ? (float) $this->commission_rate : null,
            'resolved_commission_rate' => $this->resource->resolvedCommissionRate(),
            'default_shipping_amount' => (float) $this->default_shipping_amount,
            'meta' => $this->meta,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'suspended_at' => $this->suspended_at?->toIso8601String(),
            'suspension_reason' => $this->suspension_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
