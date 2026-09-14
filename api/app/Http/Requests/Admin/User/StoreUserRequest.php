<?php

namespace App\Http\Requests\Admin\User;

use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
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
        $adminRoleIds = Role::forGuard(RoleGuardEnum::ADMIN->value)->pluck('id')->toArray();

        return [
            'name' => ['required', 'string'],
            'nickname' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'regex:/^\+[1-9]\d{6,}$/', 'unique:users,phone'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
                Rule::requiredIf(fn () => $this->input('type') === UserTypeEnum::ADMINISTRATOR->value),
            ],
            'type' => ['required', Rule::enum(UserTypeEnum::class), Rule::notIn([UserTypeEnum::SYSTEM])],
            'status' => ['nullable', Rule::enum(UserStatusEnum::class)],
            'admin_role_ids' => ['sometimes', 'array'],
            'admin_role_ids.*' => ['integer', Rule::in($adminRoleIds)],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'can_broadcast' => ['sometimes', 'boolean'],
            'is_official' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->input('type') !== UserTypeEnum::USER->value) {
                return;
            }

            $ids = $this->input('admin_role_ids', []);
            if (! is_array($ids) || $ids === []) {
                $validator->errors()->add(
                    'admin_role_ids',
                    'At least one operator role is required for operator accounts.'
                );
            }
        });
    }
}
