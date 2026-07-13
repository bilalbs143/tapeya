<?php

namespace App\Http\Requests\Admin\LiveStream;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLiveStreamRequest extends FormRequest
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
        return [
            'title' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'streaming_url' => ['sometimes', 'url', 'starts_with:https', 'max:2048'],
            'status' => ['sometimes', 'in:idle,starting,live,ended'],
        ];
    }
}
