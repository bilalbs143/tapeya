<?php

namespace App\Http\Resources\User\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $vendor = $this->relationLoaded('vendor') ? $this->vendor : null;
        if ($vendor === null && $this->relationLoaded('product') && $this->product?->relationLoaded('vendor')) {
            $vendor = $this->product->vendor;
        }

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'vendor_id' => $this->vendor_id,
            'vendor' => $vendor ? [
                'id' => $vendor->id,
                'store_name' => $vendor->store_name,
                'slug' => $vendor->slug,
            ] : null,
            'product' => $this->whenLoaded('product', fn () => new ProductResource($this->product)),
            'quantity' => $this->quantity,
            'price_snapshot' => (float) $this->price_snapshot,
            'subtotal' => (float) $this->price_snapshot * (int) $this->quantity,
        ];
    }
}
