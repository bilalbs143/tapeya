<?php

namespace App\Http\Requests\v1\Admin\Agent;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgentRequest extends FormRequest
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
        $createRules = (new CreateAgentRequest)->rules();

        unset($createRules['password'], $createRules['password_confirmation'], $createRules['parent_id']);

        $username = $this->input('username');
        $hasFourDashes = $username && str_contains($username, '----');

        $usernameRules = $hasFourDashes
            ? ['required', 'max:100', Rule::unique('users')->ignore($this->agent)]
            : ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+$/', Rule::unique('users')->ignore($this->agent)];

        return [
            ...$createRules,
            'username' => $usernameRules,
            'ref_code' => [
                'required', Rule::unique('users')->ignore($this->agent),
            ],
            'phone' => [
                'required', Rule::unique('users')->ignore($this->agent),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'username' => 'ID',
        ];
    }
}
