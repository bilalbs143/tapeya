<?php

namespace App\Http\Requests\Admin\HeroSlider;

use App\Enums\Common\StatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHeroSliderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('cta_type')) {
            return;
        }

        if ($this->filled('cta_dialog_key')) {
            $this->merge(['cta_type' => 'dialog']);

            return;
        }

        if ($this->filled('cta_url')) {
            $this->merge(['cta_type' => 'url']);

            return;
        }

        $this->merge(['cta_type' => 'none']);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'image_mobile' => ['nullable', 'image'],
            'image_desktop' => ['nullable', 'image'],
            'status' => ['required', Rule::enum(StatusEnum::class)],
        ], HeroSliderCtaRules::rules());
    }
}
