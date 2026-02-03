<?php

namespace App\Http\Requests\v1\Admin\WhitelistedIp;

use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateWhitelistedIpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('CREATE_WHITELISTED_IP');
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
                'required',
                'ipv4',
                Rule::unique('whitelisted_ips')->withoutTrashed(),
            ],
            'memo' => 'sometimes',
        ];
    }
}
