<?php

namespace App\Http\Resources\Admin\Shop;

use App\Enums\Shop\ProductDiscountTypeEnum;
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
        $salePercentage = null;
        if ($salePrice !== null && $this->discount_type !== null && $this->discount_value !== null) {
            if ($this->discount_type === ProductDiscountTypeEnum::PERCENTAGE) {
                $salePercentage = round((float) $this->discount_value, 1);
            } else {
                $price = (float) $this->price;
                $salePercentage = $price > 0 ? round((1 - $salePrice / $price) * 100, 1) : null;
            }
        }

        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'vendor' => $this->whenLoaded('vendor', fn () => $this->vendor ? [
                'id' => $this->vendor->id,
                'store_name' => $this->vendor->store_name,
                'slug' => $this->vendor->slug,
                'is_platform' => (bool) $this->vendor->is_platform,
                'status' => $this->vendor->status?->value,
            ] : null),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'sale_price' => $salePrice,
            'sale_percentage' => $salePercentage,
            'brand_id' => $this->brand_id,
            'brand' => $this->whenLoaded('brand', fn () => new BrandResource($this->brand)),
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'stock_quantity' => $this->stock_quantity,
            'low_stock_threshold' => $this->low_stock_threshold,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'is_popular' => $this->is_popular,
            'is_special_offer' => $this->is_special_offer,
            'discount_type' => $this->discount_type?->value,
            'discount_value' => $this->discount_value !== null ? (float) $this->discount_value : null,
            'discount_starts_at' => $this->discount_starts_at?->toIso8601String(),
            'discount_ends_at' => $this->discount_ends_at?->toIso8601String(),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
