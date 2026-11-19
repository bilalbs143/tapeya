<?php

namespace App\Http\Requests\Admin\Ad;

use App\Enums\Ad\AdCtaTypeEnum;
use App\Support\Ad\AdCtaUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreAdCreativeRequest extends FormRequest
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
            'campaign_id' => ['required', 'integer', 'exists:ad_campaigns,id'],
            'post_id' => ['required', 'integer', 'exists:posts,id'],
            'name' => ['required', 'string', 'max:255'],
            'headline' => ['nullable', 'string', 'max:255'],
            'cta_label' => ['required', 'string', 'max:120'],
            'cta_url' => ['required', 'string', 'max:2048'],
            'cta_type' => ['required', Rule::enum(AdCtaTypeEnum::class)],
            'disclosure_label' => ['sometimes', 'string', 'max:64'],
            'weight' => ['sometimes', 'integer', 'min:1', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $type = (string) $this->input('cta_type', '');
            $url = (string) $this->input('cta_url', '');
            if ($url === '' || $type === '') {
                return;
            }
            if (! AdCtaUrl::isValid($type, $url)) {
                $v->errors()->add('cta_url', AdCtaUrl::validationMessage($type));
            }
        });
    }
}
