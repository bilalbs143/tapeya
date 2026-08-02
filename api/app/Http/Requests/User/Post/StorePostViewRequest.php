<?php

namespace App\Http\Requests\User\Post;

use Illuminate\Foundation\Http\FormRequest;

class StorePostViewRequest extends FormRequest
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
            'watched_ms' => ['required', 'integer', 'min:0', 'max:600000'],
            'completion_rate' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ];
    }
}
