<?php

namespace App\Http\Requests\Admin\Shop;

use App\Models\Shop\Brand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreBrandRequest extends FormRequest
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
            'slug' => ['required', 'string', 'max:255'],
            'logo' => ['nullable', 'image'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $data['slug'] = $this->uniqueSlug(Str::slug($data['slug']));
        unset($data['logo']); // controller sets from file
        if (! isset($data['is_active'])) {
            $data['is_active'] = true;
        }
        if (! array_key_exists('sort_order', $data) || $data['sort_order'] === null) {
            $data['sort_order'] = 0;
        }

        return $data;
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $c = 0;
        while (Brand::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$c);
        }

        return $slug;
    }
}
