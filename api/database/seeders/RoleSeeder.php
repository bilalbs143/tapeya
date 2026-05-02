<?php

namespace Database\Seeders;

use App\Enums\User\AdminRoleEnum;
use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $appRoles = [
            ['name' => 'Player', 'slug' => AppRoleEnum::PLAYER->value, 'guard' => RoleGuardEnum::APP->value],
            ['name' => 'Organizer', 'slug' => AppRoleEnum::ORGANIZER->value, 'guard' => RoleGuardEnum::APP->value],
            ['name' => 'Sponsor', 'slug' => AppRoleEnum::SPONSOR->value, 'guard' => RoleGuardEnum::APP->value],
        ];

        foreach ($appRoles as $role) {
            Role::firstOrCreate(
                ['slug' => $role['slug'], 'guard' => $role['guard']],
                ['name' => $role['name']]
            );
        }

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
