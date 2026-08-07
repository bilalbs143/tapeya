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
     * Admin-guard permissions and role sync.
     * Broadcast operators get broadcast/tournament slugs only — never shop money/trust slugs.
     * Platform administrators bypass permission checks via EnsureAdminPermission.
     *
     * Slug list mirror: docs/BROADCASTER_ROLE.md §8 + docs/MULTI_VENDOR_MARKETPLACE_PLAN.md §5.2.
     */
    public function run(): void
    {
        $guard = RoleGuardEnum::ADMIN->value;

        $broadcastRows = [
            ['Broadcast Dashboard', 'broadcast.dashboard.view'],
            ['Broadcast Controller Session', 'broadcast.controller.session'],
            ['Tournament Manage (Scoped)', 'tournament.manage'],
            ['Tournament Create', 'tournament.create'],
            ['Tournament Broadcaster Assign', 'tournament.broadcaster.assign'],
            ['Matches Score', 'matches.score'],
        ];

        $shopRows = [
            ['Shop Catalog Manage', 'shop.catalog.manage'],
            ['Shop Vendors Manage', 'shop.vendors.manage'],
            ['Shop Products Oversee', 'shop.products.oversee'],
            ['Shop Orders Oversee', 'shop.orders.oversee'],
            ['Shop Payments Verify', 'shop.payments.verify'],
        ];

        foreach ([...$broadcastRows, ...$shopRows] as [$name, $slug]) {
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
            foreach ($broadcastRows as [, $slug]) {
                $broadcaster->givePermissionTo($slug);
            }
        }

        $super = Role::query()
            ->where('slug', AdminRoleEnum::SUPER_ADMIN->value)
            ->where('guard', $guard)
            ->first();

        if ($super) {
            foreach ([...$broadcastRows, ...$shopRows] as [, $slug]) {
                $super->givePermissionTo($slug);
            }
        }
    }
}
