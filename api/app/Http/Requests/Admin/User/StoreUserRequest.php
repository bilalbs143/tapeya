<?php

namespace App\Http\Requests\Admin\User;

use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $appRoleIds = Role::forGuard(RoleGuardEnum::APP->value)->pluck('id')->toArray();
        $adminRoleIds = Role::forGuard(RoleGuardEnum::ADMIN->value)->pluck('id')->toArray();

        return [
            'name' => ['required', 'string'],
            'nickname' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z0-9_]+$/', 'unique:users,nickname'],
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
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['integer', Rule::in($appRoleIds)],
            'admin_role_ids' => ['sometimes', 'array'],
            'admin_role_ids.*' => ['integer', Rule::in($adminRoleIds)],
            'playing_role' => ['nullable', Rule::enum(PlayingRoleEnum::class)],
            'bowling_style' => ['nullable', Rule::enum(BowlingStyleEnum::class)],
            'batting_style' => ['nullable', Rule::enum(BattingStyleEnum::class)],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
        ];
    }
}
