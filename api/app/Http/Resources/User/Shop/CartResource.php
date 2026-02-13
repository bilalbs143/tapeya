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
        ];
    }
}
