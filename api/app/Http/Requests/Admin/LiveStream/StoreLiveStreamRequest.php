<?php

namespace App\Http\Requests\Admin\LiveStream;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLiveStreamRequest extends FormRequest
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
        $provider = $this->input('provider', 'external');

        return [
            'provider' => ['sometimes', Rule::in(['external', 'youtube'])],
            'title' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'streaming_url' => [
                Rule::requiredIf($provider === 'external'),
                'nullable',
                'url',
                'starts_with:https',
                'max:2048',
            ],
            'privacy' => ['sometimes', 'in:public,unlisted'],
            'status' => ['sometimes', 'in:idle,starting,live,ended'],
        ];
    }
}
