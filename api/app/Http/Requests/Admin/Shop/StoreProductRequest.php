<?php

namespace App\Http\Requests\Admin\Shop;

use App\Enums\Shop\ProductDiscountTypeEnum;
use App\Models\Shop\Product;
use App\Models\Shop\Vendor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'vendor_id' => ['nullable', 'integer', 'exists:shop_vendors,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'brand_id' => ['required', 'integer', 'exists:shop_brands,id'],
            'category_id' => ['required', 'integer', 'exists:shop_categories,id'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'is_popular' => ['boolean'],
            'is_special_offer' => ['boolean'],
            'discount_type' => ['nullable', Rule::enum(ProductDiscountTypeEnum::class)],
            'discount_value' => ['nullable', 'numeric', 'min:0', 'required_with:discount_type'],
            'discount_starts_at' => ['nullable', 'date', 'required_with:discount_type'],
            'discount_ends_at' => ['nullable', 'date', 'required_with:discount_type', 'after_or_equal:discount_starts_at'],
            'images' => ['nullable', 'array', 'min:1'],
            'images.*' => ['image'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $vendorId = (int) ($data['vendor_id'] ?? Vendor::ensureHouse()->id);
        $data['vendor_id'] = $vendorId;
        $data['slug'] = $this->uniqueSlug(Str::slug($data['slug']), $vendorId);
        $data['sku'] = Product::generateIntelligentSku((int) $data['brand_id'], (int) $data['category_id']);
        if (array_key_exists('images', $data)) {
            unset($data['images']);
        }
        foreach (['is_active', 'is_featured', 'is_popular', 'is_special_offer'] as $bool) {
            if (! array_key_exists($bool, $data)) {
                $data[$bool] = false;
            }
        }
        if (! array_key_exists('stock_quantity', $data) || $data['stock_quantity'] === null) {
            $data['stock_quantity'] = 0;
        }
        if (! array_key_exists('low_stock_threshold', $data) || $data['low_stock_threshold'] === null) {
            $data['low_stock_threshold'] = 5;
        }
        if (isset($data['discount_type']) && ($data['discount_type'] === null || $data['discount_type'] === '')) {
            $data['discount_value'] = null;
            $data['discount_starts_at'] = null;
            $data['discount_ends_at'] = null;
        }

        return $data;
    }

    private function uniqueSlug(string $base, int $vendorId): string
    {
        $slug = $base;
        $c = 0;
        while (
            Product::query()
                ->where('slug', $slug)
                ->where('vendor_id', $vendorId)
                ->exists()
        ) {
            $slug = $base.'-'.(++$c);
        }

        return $slug;
    }
}
