<?php

namespace App\Http\Requests\Admin\Ad;

use App\Enums\Ad\BrandPartnerStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBrandPartnerRequest extends FormRequest
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
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('brand_partners', 'slug')],
            'logo_path' => ['nullable', 'string', 'max:2048'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'shop_brand_id' => ['nullable', 'integer', 'exists:shop_brands,id'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'status' => ['required', Rule::enum(BrandPartnerStatusEnum::class)],
        ];
    }
}
