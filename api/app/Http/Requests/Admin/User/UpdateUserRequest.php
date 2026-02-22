<?php

namespace App\Http\Requests\Admin\User;

use App\Enums\User\BattingStyleEnum;
use App\Enums\User\BowlingStyleEnum;
use App\Enums\User\PlayingRoleEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $appRoleIds = Role::forGuard('app')->pluck('id')->toArray();

        return [
            'name' => ['sometimes', 'required', 'string'],
            'nickname' => ['sometimes', 'nullable', 'string', 'max:50', 'regex:/^[a-zA-Z0-9_]*$/', Rule::unique('users', 'nickname')->ignore($userId)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['sometimes', 'required', 'string', 'regex:/^\+[1-9]\d{6,}$/', Rule::unique('users', 'phone')->ignore($userId)],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'type' => ['sometimes', Rule::enum(UserTypeEnum::class), Rule::notIn([UserTypeEnum::SYSTEM])],
            'status' => ['sometimes', 'nullable', Rule::enum(UserStatusEnum::class)],
            'role_ids' => ['sometimes', 'required', 'array', 'min:1'],
            'role_ids.*' => ['integer', Rule::in($appRoleIds)],
            'playing_role' => ['nullable', Rule::enum(PlayingRoleEnum::class)],
            'bowling_style' => ['nullable', Rule::enum(BowlingStyleEnum::class)],
            'batting_style' => ['nullable', Rule::enum(BattingStyleEnum::class)],
            'country' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
        ];
    }
}
