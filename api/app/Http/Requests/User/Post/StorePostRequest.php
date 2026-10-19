<?php

namespace App\Http\Requests\User\Post;

use App\Services\Safety\ObjectionableContentFilter;
use App\Settings\PostsSettings;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function () {
            app(ObjectionableContentFilter::class)->assertAllowed($this->input('body'));
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'body' => ['nullable', 'string', 'max:2200'],
            'caption' => ['nullable', 'string', 'max:2200'],
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
