<?php

namespace App\Http\Requests\Vendor\Shop;

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
            'logo' => ['nullable', 'image', 'max:2048'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        unset($data['logo'], $data['slug'], $data['is_active']);
        $base = Str::slug((string) $data['name']);
        $data['slug'] = $this->uniqueSlug($base !== '' ? $base : 'brand');
        $data['is_active'] = true;
        $data['sort_order'] = 0;

        return $data;
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base;
        $c = 0;
        while (Brand::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$c);
        }

        return $slug;
    }
}
