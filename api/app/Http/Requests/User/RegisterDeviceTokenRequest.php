<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterDeviceTokenRequest extends FormRequest
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
            'token' => ['required', 'string', 'min:10', 'max:512'],
            'platform' => ['required', 'string', Rule::in(['android', 'ios'])],
            'app_version' => ['nullable', 'string', 'max:50'],
        ];
    }
}
