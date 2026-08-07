<?php

namespace App\Http\Requests\Vendor\Shop;

use App\Enums\Shop\ProductDiscountTypeEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Http\Middleware\EnsureVendor;
use App\Models\Shop\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->routeProductId();

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('shop_products', 'slug')
                    ->where(fn ($q) => $q->where('vendor_id', $vendorId))
                    ->ignore($productId),
            ],
            'description' => ['sometimes', 'required', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'brand_id' => ['sometimes', 'required', 'integer', 'exists:shop_brands,id'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:shop_categories,id'],
            'stock_quantity' => ['sometimes', 'required', 'integer', 'min:0'],
            'low_stock_threshold' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::enum(ProductStatusEnum::class)],
            'discount_type' => ['sometimes', 'nullable', Rule::enum(ProductDiscountTypeEnum::class)],
            'discount_value' => ['sometimes', 'nullable', 'numeric', 'min:0', 'required_with:discount_type'],
            'discount_starts_at' => ['sometimes', 'nullable', 'date', 'required_with:discount_type'],
            'discount_ends_at' => ['sometimes', 'nullable', 'date', 'required_with:discount_type', 'after_or_equal:discount_starts_at'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $productId = $this->routeProductId();
        $vendorId = EnsureVendor::vendor($this)->id;
        $product = Product::query()
            ->forVendor($vendorId)
            ->whereKey($productId)
            ->firstOrFail();

        if (isset($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        }

        $brandId = (int) ($data['brand_id'] ?? $product->brand_id);
        $categoryId = (int) ($data['category_id'] ?? $product->category_id);
        $brandChanged = isset($data['brand_id']) && (int) $product->brand_id !== $brandId;
        $categoryChanged = isset($data['category_id']) && (int) $product->category_id !== $categoryId;
        if ($brandChanged || $categoryChanged) {
            $data['sku'] = Product::generateIntelligentSku($brandId, $categoryId);
        }

        if (array_key_exists('status', $data) && $data['status'] instanceof ProductStatusEnum) {
            $data['status'] = $data['status']->value;
        }

        if (isset($data['discount_type']) && ($data['discount_type'] === null || $data['discount_type'] === '')) {
            $data['discount_value'] = null;
            $data['discount_starts_at'] = null;
            $data['discount_ends_at'] = null;
        }

        unset($data['is_featured'], $data['is_popular'], $data['is_special_offer']);

        return $data;
    }

    private function routeProductId(): int
    {
        $product = $this->route('product');

        if ($product instanceof Product) {
            return (int) $product->id;
        }

        return (int) $product;
    }
}
