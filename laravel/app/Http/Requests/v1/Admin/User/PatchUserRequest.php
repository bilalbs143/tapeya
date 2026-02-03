<?php

namespace App\Http\Requests\v1\Admin\User;

use App\Enums\Membership\LevelsEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class PatchUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_MEMBER') || RolesService::can('UPDATE_AGENT');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'dob' => 'sometimes|date',
            'status' => ['sometimes', Rule::enum(UserStatusEnum::class)],
            'level' => ['sometimes', Rule::enum(LevelsEnum::class)],
            'memo' => 'sometimes|string',
            'password' => ['sometimes', 'confirmed', Password::defaults()],
            'password_confirmation' => ['sometimes'],
            'is_new_signup_first_recharge_bonus_enabled' => ['sometimes', 'boolean'],
            'is_first_recharge_bonus_of_day_enabled' => ['sometimes', 'boolean'],
            'is_bonus_per_recharge_enabled' => ['sometimes', 'boolean'],
            'referral_bonus_percentage' => ['sometimes', 'nullable', 'numeric'],
            'referral_bonus_percentage_memo' => ['sometimes', 'nullable', 'string'],
            'parent_id' => ['sometimes', 'nullable', Rule::exists('users', 'id')->withoutTrashed()->where('type', UserTypeEnum::AGENT)],
        ];
    }
}
