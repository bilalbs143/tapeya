<?php

namespace App\Http\Requests\Vendor\Shop;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:shop_categories,id', Rule::notIn([$category?->id])],
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

        return $data;
    }
}
