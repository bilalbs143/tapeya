<?php

namespace App\Http\Requests\Admin\YoutubeStreamKey;

use Illuminate\Foundation\Http\FormRequest;

class UpdateYoutubeStreamKeyRequest extends FormRequest
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
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
