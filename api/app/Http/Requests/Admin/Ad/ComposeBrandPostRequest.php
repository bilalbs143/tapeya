<?php

namespace App\Http\Requests\Admin\Ad;

use App\Enums\Post\PostTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ComposeBrandPostRequest extends FormRequest
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
            'type' => ['required', Rule::in([PostTypeEnum::Text->value, PostTypeEnum::Image->value])],
            'body' => ['nullable', 'string', 'max:5000'],
            'title' => ['nullable', 'string', 'max:255'],
            'background_id' => ['nullable', 'string', 'max:32'],
        ];
    }
}
