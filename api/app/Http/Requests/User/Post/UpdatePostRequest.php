<?php

namespace App\Http\Requests\User\Post;

use App\Enums\Post\PostVisibilityEnum;
use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Post|null $post */
        $post = $this->route('post') ?? $this->route('reel');

        return $post && $this->user()?->id === $post->user_id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => ['sometimes', 'nullable', 'string', 'max:2200'],
            'visibility' => ['sometimes', 'string', Rule::in(PostVisibilityEnum::values())],
        ];
    }
}
