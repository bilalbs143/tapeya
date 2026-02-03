<?php

namespace App\Http\Requests\v1\Admin\Role;

use App\Enums\Role\PermissionsEnum;
use App\Utils\Services\RolesService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncRolePermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return RolesService::can('SYNC_ROLE_PERMISSIONS');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', Rule::enum(PermissionsEnum::class), Rule::in(PermissionsEnum::getViewPropertyPermissions())],
        ];
    }
}
