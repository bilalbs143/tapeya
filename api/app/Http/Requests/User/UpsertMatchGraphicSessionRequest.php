<?php

namespace App\Http\Requests\User;

use App\Models\GraphicTheme;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertMatchGraphicSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'graphic_theme_id' => [
                'required',
                'integer',
                Rule::exists('graphic_themes', 'id')->where('is_active', true),
            ],
            'config' => ['sometimes', 'array'],
        ];

        if (! $this->exists('config')) {
            return $rules;
        }

        $themeId = $this->input('graphic_theme_id');
        if ($themeId && is_numeric($themeId)) {
            $theme = GraphicTheme::find((int) $themeId);
            foreach ($theme?->config_schema['properties'] ?? [] as $prop) {
                $key = $prop['key'] ?? null;
                if (! $key) {
                    continue;
                }
                $rules["config.{$key}"] = match ($prop['type'] ?? '') {
                    'color' => ['required', 'string', 'max:32', 'regex:/^#[0-9a-fA-F]{6}$/'],
                    'boolean' => ['required', 'boolean'],
                    default => ['required'],
                };
            }
        }

        return $rules;
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): mixed
    {
        /** @var array<string, mixed> $data */
        $data = parent::validated($key, $default);

        if ($key !== null) {
            return $data;
        }

        if (! isset($data['config']) || ! is_array($data['config'])) {
            return $data;
        }

        $themeId = $data['graphic_theme_id'] ?? null;
        if (! $themeId) {
            return $data;
        }

        $theme = GraphicTheme::find((int) $themeId);
        $allowed = array_column($theme?->config_schema['properties'] ?? [], 'key');
        if ($allowed !== []) {
            $data['config'] = array_intersect_key($data['config'], array_flip($allowed));
        }

        return $data;
    }
}
