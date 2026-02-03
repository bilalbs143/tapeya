<?php

namespace App\Http\Requests\v1\Admin\Agent;

use App\Enums\Membership\LevelsEnum;
use App\Enums\User\UserTypeEnum;
use App\Utils\Services\RolesService;
use App\Utils\Services\Utils;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CreateAgentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_AGENT');
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
            ? ['required', 'max:100', Rule::unique('users')]
            : ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+$/', Rule::unique('users')];

        $rules = [
            'username' => $usernameRules,
            'name' => 'required|max:100',
            'password' => ['required', 'confirmed', Password::defaults()],
            'password_confirmation' => ['required'],
            'phone' => ['required', Rule::unique('users')],
            'dob' => 'required|date',
            'bank_id' => ['required', Rule::exists('banks', 'id')->withoutTrashed()],
            'account_number' => 'required',
            'account_holder' => 'required',
            'ref_code' => ['required', Rule::unique('users')],
            'losing_point_ratio' => 'required|numeric|min:0|max:99',
            'rolling_ratio' => 'required|numeric|min:0|max:1',
            'level' => ['sometimes', Rule::enum(LevelsEnum::class)],
        ];

        if (! Utils::isAgent()) {
            $rules['parent_id'] = ['sometimes', 'nullable', Rule::exists('users', 'id')->withoutTrashed()->where('type', UserTypeEnum::AGENT)];
        }

        return $rules;
    }

    public function attributes(): array
    {
        return [
            'username' => 'ID',
        ];
    }
}
