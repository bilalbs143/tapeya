<?php

namespace Database\Seeders;

use App\Enums\Role\PermissionsEnum;
use App\Enums\Role\RolesEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $isAgentRoleRecentlyCreated = false;
        foreach (RolesEnum::values() as $role) {
            $createResponse = Role::firstOrCreate(['name' => $role, 'guard_name' => 'api']);

            // this condition is used to assign one time (which can be changed later) permissions to agent role in later function
            if ($role === RolesEnum::AGENT->value && $createResponse->wasRecentlyCreated) {
                $isAgentRoleRecentlyCreated = true;
            }
        }

        foreach (PermissionsEnum::class::values() as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        $this->assignPermissionsToAgent($isAgentRoleRecentlyCreated);

        $this->command->info('Roles and permissions seeded successfully!');
    }

    private function assignPermissionsToAgent($isAgentRoleRecentlyCreated = false)
    {
        $agentRole = Role::where('name', RolesEnum::AGENT)->first();
        $permissions = RolesEnum::AGENT->getPermissions();

        foreach ($permissions as $key => $permission) {
            if ($key === 'viewPropertyPermissions') {
                /** Commented below code because now we are assigning these permissions directly to per agent not to entire agent role */
                // if (is_array($permission) && $isAgentRoleRecentlyCreated) {
                //     foreach ($permission as $subPermission) {
                //         if (! $agentRole->hasPermissionTo($subPermission)) {
                //             $agentRole->givePermissionTo($subPermission);
                //         }
                //     }
                // }

                continue;
            }
            if (! $agentRole->hasPermissionTo($permission)) {
                $agentRole->givePermissionTo($permission);
            }
        }
    }
}
