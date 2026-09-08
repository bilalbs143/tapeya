<?php

namespace App\Http\Requests\User\Post;

use Illuminate\Foundation\Http\FormRequest;

class StoreRepostRequest extends FormRequest
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
            'body' => ['nullable', 'string', 'max:2200'],
        ];
    }
}
