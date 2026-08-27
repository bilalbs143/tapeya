<?php

namespace App\Http\Requests\Admin\HeroSlider;

use App\Enums\Content\HeroSliderCtaTypeEnum;
use App\Rules\HeroSliderCtaUrl;
use Illuminate\Validation\Rule;

class HeroSliderCtaRules
{
    private const INTEREST_CAMPAIGN_KEY = 'interestCampaign';

    /**
     * @return array<string, mixed>
     */
    public static function rules(): array
    {
        return [
            'cta_type' => ['required', Rule::enum(HeroSliderCtaTypeEnum::class)],
            'cta_label' => ['nullable', 'string', 'max:255'],
            'cta_url' => [
                'nullable',
                'required_if:cta_type,'.HeroSliderCtaTypeEnum::URL->value,
                'prohibited_unless:cta_type,'.HeroSliderCtaTypeEnum::URL->value,
                'string',
                'max:2048',
                new HeroSliderCtaUrl,
            ],
            'cta_target_blank' => ['sometimes', 'boolean'],
            'cta_dialog_key' => [
                'nullable',
                'required_if:cta_type,'.HeroSliderCtaTypeEnum::DIALOG->value,
                'prohibited_unless:cta_type,'.HeroSliderCtaTypeEnum::DIALOG->value,
                'string',
                'max:64',
                'regex:/^[a-zA-Z][a-zA-Z0-9]*$/',
            ],
            'cta_dialog_param' => [
                'nullable',
                'required_if:cta_dialog_key,'.self::INTEREST_CAMPAIGN_KEY,
                'string',
                'max:255',
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public static function payload(array $validated, bool $ctaTargetBlank = true): array
    {
        $type = HeroSliderCtaTypeEnum::from($validated['cta_type']);
        $label = isset($validated['cta_label']) ? trim((string) $validated['cta_label']) : '';

        $data = [
            'cta_type' => $type,
            'cta_label' => $label !== '' ? $label : null,
            'cta_url' => null,
            'cta_target_blank' => true,
            'cta_dialog_key' => null,
            'cta_dialog_param' => null,
        ];

        if ($type === HeroSliderCtaTypeEnum::URL) {
            $data['cta_url'] = $validated['cta_url'] ?? null;
            $data['cta_target_blank'] = $ctaTargetBlank;
        }

        if ($type === HeroSliderCtaTypeEnum::DIALOG) {
            $key = trim((string) ($validated['cta_dialog_key'] ?? ''));
            $data['cta_dialog_key'] = $key !== '' ? $key : null;
            $param = isset($validated['cta_dialog_param']) ? trim((string) $validated['cta_dialog_param']) : '';
            $data['cta_dialog_param'] = $param !== '' ? $param : null;
        }

        if ($type === HeroSliderCtaTypeEnum::NONE) {
            $data['cta_label'] = null;
        }

        return $data;
    }
}
