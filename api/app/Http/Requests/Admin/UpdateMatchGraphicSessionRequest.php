<?php

namespace App\Http\Requests\Admin;

use App\Models\GraphicTheme;
use App\Models\TournamentMatch;
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
        $rules = [
            'graphic_theme_id' => [
                'sometimes',
                'integer',
                Rule::exists('graphic_themes', 'id')->where('is_active', true),
            ],
            'config' => ['sometimes', 'array'],
        ];

        // Resolve which theme's schema to validate against:
        // prefer the incoming graphic_theme_id, fall back to the existing session's theme.
        $themeId = $this->input('graphic_theme_id');
        if (! $themeId) {
            /** @var TournamentMatch|null $match */
            $match = $this->route('match');
            $themeId = $match?->graphicSession?->graphic_theme_id;
        }

        if ($themeId && is_numeric($themeId)) {
            $theme = GraphicTheme::find((int) $themeId);
            foreach ($theme?->config_schema['properties'] ?? [] as $prop) {
                $key = $prop['key'] ?? null;
                if (! $key) {
                    continue;
                }
                $rules["config.{$key}"] = match ($prop['type'] ?? '') {
                    'color' => ['sometimes', 'string', 'max:32', 'regex:/^#[0-9a-fA-F]{6}$/'],
                    'boolean' => ['sometimes', 'boolean'],
                    default => ['sometimes'],
                };
            }
        }

        return $rules;
    }

    /**
     * Strip config keys not declared in the theme schema.
     *
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
            /** @var TournamentMatch|null $match */
            $match = $this->route('match');
            $themeId = $match?->graphicSession?->graphic_theme_id;
        }

        if ($themeId) {
            $theme = GraphicTheme::find((int) $themeId);
            $allowed = array_column($theme?->config_schema['properties'] ?? [], 'key');

            if (! empty($allowed)) {
                $data['config'] = array_intersect_key(
                    $data['config'],
                    array_flip($allowed),
                );
            }
        }

        return $data;
    }
}
