<?php

namespace App\Http\Requests\Admin\User;

use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user')?->id;
        $adminRoleIds = Role::forGuard(RoleGuardEnum::ADMIN->value)->pluck('id')->toArray();

        return [
            'name' => ['sometimes', 'required', 'string'],
            'nickname' => ['sometimes', 'nullable', 'string', 'max:50', 'regex:/^(?:[A-Za-z]+(?:\s+[A-Za-z]+)*)?$/'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['sometimes', 'required', 'string', 'regex:/^\+[1-9]\d{6,}$/', Rule::unique('users', 'phone')->ignore($userId)],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'type' => ['sometimes', Rule::enum(UserTypeEnum::class), Rule::notIn([UserTypeEnum::SYSTEM])],
            'status' => ['sometimes', 'nullable', Rule::enum(UserStatusEnum::class)],
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
            /** @var User|null $user */
            $user = $this->route('user');
            $type = $this->input('type');
            if ($type === null && $user?->type instanceof UserTypeEnum) {
                $type = $user->type->value;
            }

            if ($type !== UserTypeEnum::USER->value) {
                return;
            }

            if (! $this->exists('admin_role_ids')) {
                $existing = $user?->roles()
                    ->where('roles.guard', RoleGuardEnum::ADMIN->value)
                    ->count() ?? 0;
                if ($existing < 1) {
                    $validator->errors()->add(
                        'admin_role_ids',
                        'At least one operator role is required for operator accounts.'
                    );
                }

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
