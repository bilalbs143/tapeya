<?php

namespace App\Models;

use App\Enums\Role\RolesEnum;
use App\Utils\Traits\Model\BaseModelTrait;
use Spatie\Permission\Models\Role as ModelsRole;
use Spatie\Permission\PermissionRegistrar;

class Role extends ModelsRole
{
    use BaseModelTrait;

    protected $casts = [
        'name' => RolesEnum::class,
    ];

    public static function getFilters()
    {
        return [
            'name',
            'guard_name',
        ];
    }

    public static function getSorts()
    {
        return [
            'id',
            'name',
            'guard_name',
            'created_at',
            'updated_at',
        ];
    }

    public function __permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            config('permission.table_names.role_has_permissions'),
            app(PermissionRegistrar::class)->pivotRole,
            app(PermissionRegistrar::class)->pivotPermission
        );
    }
}
