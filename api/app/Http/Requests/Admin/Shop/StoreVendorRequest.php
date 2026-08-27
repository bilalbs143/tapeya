<?php

namespace App\Http\Requests\Admin\Shop;

use App\Enums\Shop\VendorStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVendorRequest extends FormRequest
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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'store_name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in([
                VendorStatusEnum::PENDING->value,
                VendorStatusEnum::APPROVED->value,
            ])],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'default_shipping_amount' => ['nullable', 'numeric', 'min:0'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
