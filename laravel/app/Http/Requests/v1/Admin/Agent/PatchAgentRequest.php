<?php

namespace App\Http\Requests\v1\Admin\Agent;

use App\Enums\Membership\LevelsEnum;
use App\Enums\User\UserStatusEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class PatchAgentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_AGENT');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $username = $this->input('username');
        $hasFourDashes = $username && str_contains($username, '----');

        $usernameRules = $hasFourDashes
            ? ['sometimes', 'max:100', Rule::unique('users')->ignore($this->agent)]
            : ['sometimes', 'string', 'max:100', 'regex:/^[a-z0-9]+$/', Rule::unique('users')->ignore($this->agent)];

        return [
            'username' => $usernameRules,
            'ref_code' => [
                'sometimes', Rule::unique('users')->ignore($this->agent),
            ],
            'phone' => [
                'sometimes', Rule::unique('users')->ignore($this->agent),
            ],
            'name' => 'sometimes|max:100',
            'password' => ['sometimes', 'confirmed', Password::defaults()],
            'password_confirmation' => ['sometimes'],
            'dob' => 'sometimes|date',
            'bank_id' => ['sometimes', Rule::exists('banks', 'id')->withoutTrashed()],
            'account_number' => 'sometimes',
            'account_holder' => 'sometimes',
            'losing_point_ratio' => 'sometimes|numeric|min:0|max:99',
            'rolling_ratio' => 'sometimes|numeric|min:0|max:1',
            'level' => ['sometimes', Rule::enum(LevelsEnum::class)],
            'memo' => 'sometimes|string',
            'status' => ['sometimes', Rule::enum(UserStatusEnum::class)],
            'domains' => 'sometimes|array',
            'telegrams' => 'sometimes|array',
            'kakao_talks' => 'sometimes|array',
            'is_new_signup_first_recharge_bonus_enabled' => ['sometimes', 'boolean'],
            'is_first_recharge_bonus_of_day_enabled' => ['sometimes', 'boolean'],
            'is_bonus_per_recharge_enabled' => ['sometimes', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'username' => 'ID',
        ];
    }
}
