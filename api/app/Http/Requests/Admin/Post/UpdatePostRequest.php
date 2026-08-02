<?php

namespace App\Http\Requests\Admin\Post;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostVisibilityEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Backoffice historically sends `caption`; map to `body` when body is absent.
        if ($this->has('caption') && ! $this->exists('body')) {
            $this->merge(['body' => $this->input('caption')]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::in(array_column(PostStatusEnum::cases(), 'value'))],
            'visibility' => ['sometimes', 'string', Rule::in(array_column(PostVisibilityEnum::cases(), 'value'))],
            'body' => ['sometimes', 'nullable', 'string', 'max:2200'],
            'caption' => ['sometimes', 'nullable', 'string', 'max:2200'],
        ];
    }
}
