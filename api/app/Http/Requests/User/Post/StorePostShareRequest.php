<?php

namespace App\Http\Requests\User\Post;

use App\Enums\Post\PostShareChannelEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostShareRequest extends FormRequest
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
            'channel' => ['nullable', 'string', Rule::in(PostShareChannelEnum::values())],
        ];
    }
}
