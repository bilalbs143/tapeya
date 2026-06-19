<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMatchGraphicSessionRequest extends FormRequest
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
            'graphic_theme_id' => [
                'sometimes',
                'integer',
                Rule::exists('graphic_themes', 'id')->where('is_active', true),
            ],
            'config' => ['sometimes', 'array'],
        ];
    }
}
