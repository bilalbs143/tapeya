<?php

namespace App\Utils\Services;

use App\Enums\Role\PermissionsEnum;
use App\Models\User;
use Spatie\Permission\Models\Role;

class RolesService
{
    public static function findRole($role)
    {
        return Role::where('guard_name', 'api')->where('name', $role)->first();
    }

    public static function assignRole(User $user, $role)
    {
        $role = self::findRole($role);

        $user->assignRole($role);
    }

    public static function getPermission(string $permission)
    {
        $permissionsEnum = PermissionsEnum::class;

        if (defined("$permissionsEnum::$permission")) {
            return constant("$permissionsEnum::$permission")->value;
        }

        return null;
    }

    public static function getPermissions(...$_permissions)
    {
        $permissions = [];

        foreach ($_permissions as $permission) {
            $permissions[] = self::getPermission($permission);
        }

        return implode('|', $permissions);
    }

    public static function can(string $_permission)
    {
        $permission = self::getPermission($_permission);

        return auth()->user()->can($permission);
    }
}
