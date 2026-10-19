<?php

namespace App\Http\Requests\User\Post;

use App\Services\Safety\ObjectionableContentFilter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePostCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function () {
            app(ObjectionableContentFilter::class)->assertAllowed($this->input('body'));
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:1', 'max:500'],
            'parent_id' => ['nullable', 'integer', 'exists:post_comments,id'],
        ];
    }
}
