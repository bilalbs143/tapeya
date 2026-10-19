<?php

namespace App\Http\Requests\User\Post;

use App\Models\Post;
use App\Services\Safety\ObjectionableContentFilter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Post|null $post */
        $post = $this->route('post') ?? $this->route('reel');

        return $post && $this->user()?->id === $post->user_id;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function () {
            if ($this->exists('body')) {
                app(ObjectionableContentFilter::class)->assertAllowed($this->input('body'));
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => ['sometimes', 'nullable', 'string', 'max:2200'],
        ];
    }
}
