<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\Role\RolesEnum;
use App\Http\Requests\v1\Admin\Role\SyncRolePermissionsRequest;
use App\Http\Resources\v1\Role\RoleResource;
use App\Models\Role;

class RoleController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Role::class, RoleResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->query();
    }

    public function show(RolesEnum $role)
    {
        $role = $this->baseQuery()->with('__permissions')->where('name', $role)->firstOrFail();

        return $this->_show($role);
    }

    public function syncPermissions(SyncRolePermissionsRequest $request, Role $role)
    {
        if ($role->name === RolesEnum::AGENT) {
            $agentDefaultPermissions = $role->name?->getDefaultPermissions();

            $permissions = [
                ...$agentDefaultPermissions,
                ...$request->permissions,
            ];
            $role->syncPermissions($permissions);

            return $this->success(new $this->resource($role), 'permissions_synced_successfully');
        }

        return $this->forbidden('forbidden');

    }
}
