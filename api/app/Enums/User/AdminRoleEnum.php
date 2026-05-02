<?php

namespace App\Enums\User;

use App\Contracts\RoleEnumInterface;
use App\Enums\BaseEnumTrait;

/**
 * Roles on the admin guard. {@see self::SUPER_ADMIN} is for platform administrators;
 * {@see self::BROADCASTER} is the backoffice Broadcast Operator role (typically type=user accounts).
 */
enum AdminRoleEnum: string implements RoleEnumInterface
{
    use BaseEnumTrait;

    case SUPER_ADMIN = 'super_admin';
    case BROADCASTER = 'broadcaster';

    public function guard(): string
    {
        return RoleGuardEnum::ADMIN->value;
    }

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::BROADCASTER => 'Broadcast Operator',
        };
    }
}
