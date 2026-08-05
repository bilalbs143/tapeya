<?php

namespace Database\Seeders;

use App\Enums\User\AdminRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $adminRoles = [
            ['name' => 'Super Admin', 'slug' => AdminRoleEnum::SUPER_ADMIN->value, 'guard' => RoleGuardEnum::ADMIN->value],
            ['name' => 'Broadcast Operator', 'slug' => AdminRoleEnum::BROADCASTER->value, 'guard' => RoleGuardEnum::ADMIN->value],
        ];

        foreach ($adminRoles as $role) {
            Role::firstOrCreate(
                ['slug' => $role['slug'], 'guard' => $role['guard']],
                ['name' => $role['name']]
            );
        }
    }
}
