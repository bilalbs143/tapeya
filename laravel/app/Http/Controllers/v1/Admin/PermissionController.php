<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\Role\PermissionsEnum;
use App\Http\Resources\v1\Permission\PermissionResource;
use App\Models\Permission;

class PermissionController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Permission::class, PermissionResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->whereIn('name', PermissionsEnum::getViewPropertyPermissions());
    }

    public function viewPropertyPermissions()
    {
        $records = $this->index();

        return $this->resource::collection($records);
    }
}
