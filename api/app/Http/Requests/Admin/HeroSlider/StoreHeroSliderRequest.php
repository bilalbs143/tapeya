<?php

namespace App\Http\Requests\Admin\HeroSlider;

use App\Enums\Common\StatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHeroSliderRequest extends FormRequest
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
            'image' => ['required', 'image', 'max:5120'],
            'status' => ['required', Rule::enum(StatusEnum::class)],
        ];
    }
}
