<?php

namespace App\Http\Resources\User\Shop;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $salePrice = $this->resource->hasValidDiscount() ? $this->resource->getSalePrice() : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'sale_price' => $salePrice,
            'brand_id' => $this->brand_id,
            'brand' => $this->whenLoaded('brand', fn () => new BrandResource($this->brand)),
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'stock_quantity' => $this->stock_quantity,
            'low_stock_threshold' => $this->low_stock_threshold ?? 5,
            'is_featured' => $this->is_featured,
            'is_popular' => $this->is_popular,
            'is_special_offer' => $this->is_special_offer,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
