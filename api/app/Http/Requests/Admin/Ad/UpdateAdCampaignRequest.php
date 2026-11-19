<?php

namespace App\Http\Requests\Admin\Ad;

use App\Enums\Ad\AdCampaignObjectiveEnum;
use App\Enums\Ad\AdCampaignStatusEnum;
use App\Enums\Ad\AdSurfaceEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAdCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(AdTargetingRules::normalize($this->all()));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'brand_partner_id' => ['sometimes', 'integer', 'exists:brand_partners,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', Rule::enum(AdCampaignStatusEnum::class)],
            'objective' => ['sometimes', Rule::enum(AdCampaignObjectiveEnum::class)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'priority' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'surfaces' => ['sometimes', 'array', 'min:1'],
            'surfaces.*' => ['string', Rule::in(AdSurfaceEnum::values())],
            'slot_every_n' => ['sometimes', 'nullable', 'integer', 'min:3', 'max:50'],
            'max_ads_per_response' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
            'budget_notes' => ['nullable', 'string', 'max:5000'],
        ], AdTargetingRules::rules());
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(fn (Validator $v) => AdTargetingRules::rejectUnknownKeys($v));
    }
}
