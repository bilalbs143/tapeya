<?php

namespace App\Http\Requests\Admin\YoutubeStreamKey;

use Illuminate\Foundation\Http\FormRequest;

class StoreYoutubeStreamKeyRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:100'],
        ];
    }
}
