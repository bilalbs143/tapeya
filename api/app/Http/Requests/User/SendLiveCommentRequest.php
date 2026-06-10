<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class SendLiveCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:1', 'max:500'],
        ];
    }
}
