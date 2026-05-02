<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Enums\User\AppRoleEnum;
use App\Enums\User\RoleGuardEnum;
use App\Models\Role;
use App\Models\User;

/**
 * Tournament staff who operate scoring in the app need the Organizer app role.
 * Broadcast staff on the tournament pivot are treated the same as the organizer for app capabilities.
 */
trait EnsuresTournamentStaffAppRoles
{
    /**
     * Ensure the user has the Organizer app role (tournament organizer or broadcast staff on pivot).
     */
    protected function ensureOrganizerRole(int $userId): void
    {
        $organizerRole = Role::findBySlug(AppRoleEnum::ORGANIZER->value, RoleGuardEnum::APP->value);
        if (! $organizerRole) {
            return;
        }

        $user = User::find($userId);
        if ($user && ! $user->hasRole(AppRoleEnum::ORGANIZER)) {
            $user->roles()->syncWithoutDetaching([$organizerRole->id]);
        }
    }
}
