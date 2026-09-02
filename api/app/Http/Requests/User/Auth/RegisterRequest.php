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

        if ($this->filled('name')) {
            $this->merge(['name' => trim((string) $this->input('name'))]);
        }

        if ($this->filled('nickname')) {
            $this->merge(['nickname' => trim((string) $this->input('nickname'))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/'],
            'nickname' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/'],
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,14}$/', Rule::unique('users', 'phone')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Name may only contain letters and spaces.',
            'nickname.regex' => 'Nickname may only contain letters and spaces.',
            'phone.regex' => 'Phone must include country code (e.g. +923001234567).',
            'phone.unique' => 'This phone number is already registered. Try logging in instead.',
        ];
    }
}
