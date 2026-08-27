<?php

namespace App\Http\Resources\User\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->relationLoaded('items') ? $this->items : collect();

        $vendorGroups = $items
            ->groupBy(fn ($item) => (int) ($item->vendor_id ?: $item->product?->vendor_id ?: 0))
            ->filter(fn ($_, $vendorId) => (int) $vendorId > 0)
            ->map(function ($groupItems) {
                $first = $groupItems->first();
                $vendor = $first->relationLoaded('vendor') ? $first->vendor : $first->product?->vendor;

                return [
                    'vendor' => $vendor ? [
                        'id' => $vendor->id,
                        'store_name' => $vendor->store_name,
                        'slug' => $vendor->slug,
                    ] : null,
                    'items' => CartItemResource::collection($groupItems)->resolve(),
                    'subtotal' => round($groupItems->sum(fn ($item) => (float) $item->price_snapshot * (int) $item->quantity), 2),
                ];
            })
            ->values()
            ->all();

        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'items_count' => $this->when(
                $this->relationLoaded('items'),
                fn () => (int) $this->items->sum('quantity')
            ),
            'subtotal' => $this->when(
                $this->relationLoaded('items'),
                fn () => round($this->items->sum(fn ($item) => (float) $item->price_snapshot * (int) $item->quantity), 2)
            ),
            'vendor_groups' => $this->when(
                $this->relationLoaded('items'),
                fn () => $vendorGroups
            ),
        ];
    }
}
