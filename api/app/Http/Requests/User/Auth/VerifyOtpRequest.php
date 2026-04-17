<?php

namespace App\Http\Requests\User\Auth;

use App\Utils\Services\OtpService;
use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
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
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
            'code' => ['required', 'string', 'size:4', 'regex:/^\d{4}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must include country code (e.g. +441234567890).',
            'code.regex' => 'OTP must be 4 digits.',
            'code.size' => 'OTP must be 4 digits.',
        ];
    }
}
