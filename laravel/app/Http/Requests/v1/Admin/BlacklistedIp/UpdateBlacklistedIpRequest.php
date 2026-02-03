<?php

namespace App\Http\Requests\v1\Admin\BlacklistedIp;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBlacklistedIpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('UPDATE_BLACKLISTED_IP');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ip' => [
                'sometimes',
                'ipv4',
                Rule::unique('blacklisted_ips')->ignore($this->blacklistedIp)->withoutTrashed(),
            ],
            'memo' => 'sometimes',
        ];
    }
}
