<?php

namespace App\Http\Requests\v1\Admin\Promotion;

use App\Enums\Common\StatusEnum;
use App\Enums\Promotion\PromotionTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePromotionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => [
                'required',
                Rule::in(PromotionTypeEnum::values()),
                Rule::unique('promotions', 'type')->whereNull('deleted_at'),
            ],
            'status' => ['required', Rule::in(StatusEnum::values())],
            'valid_from' => ['nullable', 'date'],
            'valid_to' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_stackable' => ['sometimes', 'boolean'],
            'is_visible' => ['sometimes', 'boolean'],
            'game_scope' => ['nullable', 'array'],
            'config' => ['required', 'array'],
            'image' => ['required', 'image'],
        ];
    }
}
