<?php

namespace App\Http\Requests\v1\Admin\MembershipCommissionSetting;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMembershipCommissionSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_MEMBERSHIP_COMMISSION_SETTING');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'data' => ['required', 'array'],
            'data.*.id' => ['required', 'integer', Rule::exists('membership_commission_settings')->withoutTrashed()],
            'data.*.new_signup_first_recharge_bonus' => ['required', 'numeric', 'min:0', 'max:100'],
            'data.*.new_signup_first_recharge_bonus_maximum_amount' => ['required', 'numeric', 'min:0'],
            'data.*.first_recharge_bonus_of_day' => ['required', 'numeric', 'min:0', 'max:100'],
            'data.*.first_recharge_bonus_of_day_maximum_amount' => ['required', 'numeric', 'min:0'],
            'data.*.bonus_per_recharge' => ['required', 'numeric', 'min:0', 'max:100'],
            'data.*.bonus_per_recharge_maximum_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
