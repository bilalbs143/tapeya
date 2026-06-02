<?php

namespace App\Http\Requests\Admin\Highlight;

use App\Enums\Highlight\HighlightVideoSourceEnum;
use App\Rules\YouTubeUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHighlightRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'video_source' => ['sometimes', 'required', Rule::enum(HighlightVideoSourceEnum::class)],
            'video' => [
                'exclude_unless:video_source,'.HighlightVideoSourceEnum::YOUTUBE->value,
                'required_if:video_source,'.HighlightVideoSourceEnum::YOUTUBE->value,
                'string',
                'max:2048',
                new YouTubeUrl,
            ],
            'duration' => ['nullable', 'string', 'max:32'],
            'tournament_id' => ['nullable', 'integer', 'exists:tournaments,id'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
