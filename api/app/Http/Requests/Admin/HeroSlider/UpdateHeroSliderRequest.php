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

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'image_mobile' => ['nullable', 'image', 'min:1', 'max:5120'],
            'image_desktop' => ['nullable', 'image', 'min:1', 'max:5120'],
            'status' => ['required', Rule::enum(StatusEnum::class)],
        ];
    }
}
