<?php

namespace App\Http\Requests\User\Post;

use App\Enums\Post\PostVisibilityEnum;
use App\Settings\PostsSettings;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
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
            'body' => ['nullable', 'string', 'max:2200'],
            'caption' => ['nullable', 'string', 'max:2200'],
            'visibility' => ['nullable', 'string', Rule::in(PostVisibilityEnum::values())],
            'client_duration_ms' => ['nullable', 'integer', 'min:1'],
        ];

        $maxDurationSeconds = app(PostsSettings::class)->maxDurationSeconds;
        if ($maxDurationSeconds > 0) {
            $rules['client_duration_ms'][] = 'max:'.($maxDurationSeconds * 1000);
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('body') && $this->filled('caption')) {
            $this->merge(['body' => $this->input('caption')]);
        }
    }
}
