<?php

namespace App\Http\Requests\User\Auth;

use App\Utils\Services\OtpService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => OtpService::normalizePhone($this->input('phone'))]);
        }

        if ($this->has('email') && $this->input('email') === '') {
            $this->merge(['email' => null]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'nickname' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z0-9_]+$/', Rule::unique('users', 'nickname')],
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,14}$/', Rule::unique('users', 'phone')],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
        ];
    }

    public function messages(): array
    {
        return [
            'nickname.regex' => 'Nickname may only contain letters, numbers and underscores.',
            'nickname.unique' => 'This nickname is already taken. Please choose another.',
            'phone.regex' => 'Phone must include country code (e.g. +923001234567).',
            'phone.unique' => 'This phone number is already registered. Try logging in instead.',
            'email.unique' => 'This email is already registered. Try logging in or use a different email.',
        ];
    }
}
