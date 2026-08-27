<?php

namespace App\Http\Resources\User\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'vendor' => $this->when(
                $this->relationLoaded('vendor') && $this->vendor,
                fn () => [
                    'id' => $this->vendor->id,
                    'store_name' => $this->vendor->store_name,
                    'slug' => $this->vendor->slug,
                    'phone' => $this->vendor->phone,
                ]
            ),
            'vendor_order_number' => $this->vendor_order_number,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'subtotal' => (float) $this->subtotal,
            'shipping_amount' => (float) $this->shipping_amount,
            'discount_amount' => (float) $this->discount_amount,
            'total' => (float) $this->total,
            'tracking_number' => $this->tracking_number,
            'carrier' => $this->carrier,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
