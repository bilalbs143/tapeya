<?php

namespace App\Http\Requests\Vendor\Shop;

use App\Models\Shop\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoryRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:shop_categories,id'],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('parent_id') && ($this->input('parent_id') === '' || $this->input('parent_id') === '0' || $this->input('parent_id') === 0)) {
            $this->merge(['parent_id' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        unset($data['image'], $data['slug'], $data['is_active']);
        $base = Str::slug((string) $data['name']);
        $data['slug'] = $this->uniqueSlug($base !== '' ? $base : 'category');
        $data['is_active'] = true;
        if (! array_key_exists('parent_id', $data)) {
            $data['parent_id'] = null;
        }
        $data['sort_order'] = 0;

        return $data;
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $c = 0;
        while (Category::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$c);
        }

        return $slug;
    }
}
