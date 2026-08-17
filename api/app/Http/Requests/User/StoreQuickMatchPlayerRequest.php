<?php

namespace App\Http\Requests\User;

use App\Models\CricketMatch;
use App\Utils\Services\OtpService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQuickMatchPlayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $match = $this->route('quickMatch');

        return $user !== null
            && $match instanceof CricketMatch
            && $user->canOperateQuickMatch($match);
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('name')) {
            $this->merge(['name' => trim((string) $this->input('name'))]);
        }
        if ($this->filled('phone')) {
            $this->merge(['phone' => OtpService::normalizePhone((string) $this->input('phone'))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['nullable', 'string', 'max:255', 'regex:/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/'],
            'phone' => ['nullable', 'string', 'regex:/^\+[1-9]\d{6,14}$/'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $hasUser = $this->filled('user_id');
            $hasName = $this->filled('name');
            $hasPhone = $this->filled('phone');
            if ($hasUser && ($hasName || $hasPhone)) {
                $validator->errors()->add('user_id', 'Provide either user_id or name+phone, not both.');
            }
            if (! $hasUser && (! $hasName || ! $hasPhone)) {
                $validator->errors()->add('name', 'New players require name and phone.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.regex' => 'Name may only contain letters and spaces.',
            'phone.regex' => 'Phone must include country code (e.g. +923001234567).',
        ];
    }
}
