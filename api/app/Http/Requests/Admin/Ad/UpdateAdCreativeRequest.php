<?php

namespace App\Http\Requests\Admin\Ad;

use App\Enums\Ad\AdCtaTypeEnum;
use App\Support\Ad\AdCtaUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAdCreativeRequest extends FormRequest
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
            'campaign_id' => ['sometimes', 'integer', 'exists:ad_campaigns,id'],
            'post_id' => ['sometimes', 'integer', 'exists:posts,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'headline' => ['nullable', 'string', 'max:255'],
            'cta_label' => ['sometimes', 'string', 'max:120'],
            'cta_url' => ['sometimes', 'string', 'max:2048'],
            'cta_type' => ['sometimes', Rule::enum(AdCtaTypeEnum::class)],
            'disclosure_label' => ['sometimes', 'string', 'max:64'],
            'weight' => ['sometimes', 'integer', 'min:1', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if (! $this->filled('cta_url') && ! $this->filled('cta_type')) {
                return;
            }

            $type = $this->input('cta_type', $this->route('ad_creative')?->cta_type?->value ?? 'url');
            if ($type instanceof AdCtaTypeEnum) {
                $type = $type->value;
            }
            $url = (string) $this->input('cta_url', $this->route('ad_creative')?->cta_url ?? '');
            if ($url === '') {
                return;
            }
            if (! AdCtaUrl::isValid((string) $type, $url)) {
                $v->errors()->add('cta_url', AdCtaUrl::validationMessage((string) $type));
            }
        });
    }
}
