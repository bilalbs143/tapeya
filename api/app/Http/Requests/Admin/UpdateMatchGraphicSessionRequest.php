<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

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
            'graphic_theme_id' => ['sometimes', 'integer', 'exists:graphic_themes,id'],
            'config' => ['sometimes', 'array'],
            'context' => ['sometimes', 'array'],
        ];
    }
}
