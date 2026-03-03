<?php

namespace App\Enums\User;

use App\Contracts\RoleEnumInterface;
use App\Enums\BaseEnumTrait;

/**
 * Roles for admins (type=administrator). Extend with more cases as needed.
 */
enum AdminRoleEnum: string implements RoleEnumInterface
{
    use BaseEnumTrait;

    case SUPER_ADMIN = 'super_admin';
    // e.g. CONTENT_MODERATOR = 'content_moderator';

    public function guard(): string
    {
        return RoleGuardEnum::ADMIN->value;
    }

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Admin',
        };
    }
}
