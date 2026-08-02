<?php

namespace App\Http\Requests\User\Post;

use App\Enums\Post\PostBackgroundId;
use App\Enums\Post\PostVisibilityEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreComposePostRequest extends FormRequest
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
        $type = $this->input('type');

        $rules = [
            'type' => ['required', 'string', Rule::in(['text', 'image', 'video'])],
            'title' => ['nullable', 'string', 'max:200'],
            'body' => ['nullable', 'string', 'max:2200'],
            'caption' => ['nullable', 'string', 'max:2200'],
            'visibility' => ['nullable', 'string', Rule::in(PostVisibilityEnum::values())],
            'client_duration_ms' => ['nullable', 'integer', 'min:1'],
        ];

        if ($type === 'text') {
            $rules['body'] = ['required', 'string', 'max:2200'];
            $rules['background_id'] = ['nullable', 'string', Rule::in(PostBackgroundId::inputValues())];
        }

        if ($type === 'image') {
            $rules['images'] = ['required', 'array', 'min:1', 'max:10'];
            $rules['images.*'] = ['required', 'image', 'max:10240'];
        }

        // type=video: creates upload shell only; multipart continues on POST /reels/{id}/upload/*.

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('body') && $this->filled('caption')) {
            $this->merge(['body' => $this->input('caption')]);
        }

        // Drop background on non-text so it cannot leak into image/video payloads.
        if ($this->input('type') !== 'text') {
            $this->merge(['background_id' => null]);
        }
    }
}
