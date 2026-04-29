<?php

namespace Database\Seeders;

use App\Enums\User\AdminRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Admin-guard permissions and role sync. {@see AdminRoleEnum::BROADCASTER} and {@see AdminRoleEnum::SUPER_ADMIN}
     * receive the same slug bundle. Attach to routes with middleware when needed; platform administrators bypass permission checks.
     *
     * Slug list mirror: docs/BROADCASTER_ROLE.md §8 — keep in sync when adding rows here.
     */
    public function run(): void
    {
        $guard = RoleGuardEnum::ADMIN->value;

        $rows = [
            ['Broadcast Dashboard', 'broadcast.dashboard.view'],
            ['Broadcast Controller Session', 'broadcast.controller.session'],
            ['Tournament Manage (Scoped)', 'tournament.manage'],
            ['Tournament Create', 'tournament.create'],
            ['Tournament Broadcaster Assign', 'tournament.broadcaster.assign'],
            ['Matches Score', 'matches.score'],
        ];

        foreach ($rows as [$name, $slug]) {
            Permission::firstOrCreate(
                ['slug' => $slug, 'guard' => $guard],
                ['name' => $name]
            );
        }

        $broadcaster = Role::query()
            ->where('slug', AdminRoleEnum::BROADCASTER->value)
            ->where('guard', $guard)
            ->first();

        if ($broadcaster) {
            foreach ($rows as [, $slug]) {
                $broadcaster->givePermissionTo($slug);
            }
        }

        $super = Role::query()
            ->where('slug', AdminRoleEnum::SUPER_ADMIN->value)
            ->where('guard', $guard)
            ->first();

        if ($super) {
            foreach ($rows as [, $slug]) {
                $super->givePermissionTo($slug);
            }
        }
    }
}
