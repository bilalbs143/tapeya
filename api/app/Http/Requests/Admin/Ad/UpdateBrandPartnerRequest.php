<?php

namespace App\Http\Requests\Admin\Ad;

use App\Enums\Ad\BrandPartnerStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandPartnerRequest extends FormRequest
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
        $id = $this->route('brand_partner')?->id ?? $this->route('brand_partner');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash', Rule::unique('brand_partners', 'slug')->ignore($id)],
            'logo_path' => ['nullable', 'string', 'max:2048'],
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'shop_brand_id' => ['nullable', 'integer', 'exists:shop_brands,id'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'status' => ['sometimes', Rule::enum(BrandPartnerStatusEnum::class)],
        ];
    }
}
