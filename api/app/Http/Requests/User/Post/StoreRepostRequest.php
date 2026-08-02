<?php

namespace App\Http\Requests\User\Post;

use App\Enums\Post\PostVisibilityEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'visibility' => ['nullable', 'string', Rule::in(PostVisibilityEnum::values())],
        ];
    }
}
