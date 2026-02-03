<?php

namespace App\Models;

use App\Enums\Role\PermissionsEnum;
use App\Utils\Traits\Model\BaseModelTrait;
use Spatie\Permission\Models\Permission as ModelsPermission;

class Permission extends ModelsPermission
{
    use BaseModelTrait;

    protected $casts = [
        'name' => PermissionsEnum::class,
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
}
