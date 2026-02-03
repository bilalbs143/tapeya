<?php

namespace App\Http\Requests\v1\Auth\Profile;

use App\Enums\User\UserLocaleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => [
                'sometimes', 'string', 'max:100', 'regex:/^[a-z0-9]+$/',
                Rule::unique('users')->ignore(auth()->user()),
            ],
            'phone' => ['sometimes', Rule::unique('users')->ignore(auth()->user())],
            'name' => 'sometimes|max:100',
            'dob' => 'sometimes|date',
            'bank_id' => ['sometimes', Rule::exists('banks', 'id')->withoutTrashed()],
            'account_number' => 'sometimes',
            'account_holder' => 'sometimes',
            'memo' => 'sometimes|string',
            'locale' => ['sometimes', Rule::enum(UserLocaleEnum::class)],
        ];
    }

    public function attributes(): array
    {
        return [
            'username' => 'ID',
        ];
    }
}
