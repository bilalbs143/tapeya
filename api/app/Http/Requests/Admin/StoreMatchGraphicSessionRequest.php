<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMatchGraphicSessionRequest extends FormRequest
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
                'required',
                'integer',
                Rule::exists('graphic_themes', 'id')->where('is_active', true),
            ],
            'config' => ['required', 'array'],
            'config.teams' => ['required', 'array'],
            'config.teams.home' => ['required', 'array'],
            'config.teams.home.text_color' => ['required', 'string', 'max:32'],
            'config.teams.home.bg_color' => ['required', 'string', 'max:32'],
            'config.teams.away' => ['required', 'array'],
            'config.teams.away.text_color' => ['required', 'string', 'max:32'],
            'config.teams.away.bg_color' => ['required', 'string', 'max:32'],
            'config.enable_images' => ['required', 'boolean'],
        ];
    }
}
