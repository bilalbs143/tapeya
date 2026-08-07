<?php

namespace App\Http\Requests\Vendor\Shop;

use App\Enums\Shop\ProductDiscountTypeEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Http\Middleware\EnsureVendor;
use App\Models\Shop\Product;
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
        $vendorId = EnsureVendor::vendor($this)->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('shop_products', 'slug')->where(fn ($q) => $q->where('vendor_id', $vendorId)),
            ],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'brand_id' => ['required', 'integer', 'exists:shop_brands,id'],
            'category_id' => ['required', 'integer', 'exists:shop_categories,id'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'status' => ['nullable', Rule::enum(ProductStatusEnum::class)],
            'discount_type' => ['nullable', Rule::enum(ProductDiscountTypeEnum::class)],
            'discount_value' => ['nullable', 'numeric', 'min:0', 'required_with:discount_type'],
            'discount_starts_at' => ['nullable', 'date', 'required_with:discount_type'],
            'discount_ends_at' => ['nullable', 'date', 'required_with:discount_type', 'after_or_equal:discount_starts_at'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $data['slug'] = Str::slug($data['slug']);
        $data['sku'] = Product::generateIntelligentSku((int) $data['brand_id'], (int) $data['category_id']);
        $data['status'] = $data['status'] ?? ProductStatusEnum::DRAFT->value;
        if ($data['status'] instanceof ProductStatusEnum) {
            $data['status'] = $data['status']->value;
        }
        if (! array_key_exists('is_active', $data)) {
            $data['is_active'] = true;
        }
        if (! array_key_exists('low_stock_threshold', $data) || $data['low_stock_threshold'] === null) {
            $data['low_stock_threshold'] = 5;
        }
        if (isset($data['discount_type']) && ($data['discount_type'] === null || $data['discount_type'] === '')) {
            $data['discount_value'] = null;
            $data['discount_starts_at'] = null;
            $data['discount_ends_at'] = null;
        }
        unset($data['is_featured'], $data['is_popular'], $data['is_special_offer']);

        return $data;
    }
}
