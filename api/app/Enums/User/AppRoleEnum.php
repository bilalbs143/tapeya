<?php

namespace App\Enums\User;

use App\Contracts\RoleEnumInterface;
use App\Enums\BaseEnumTrait;

/**
 * Roles for app users (type=user). Player, organizer, sponsor.
 */
enum AppRoleEnum: string implements RoleEnumInterface
{
    use BaseEnumTrait;

    case PLAYER = 'player';
    case ORGANIZER = 'organizer';
    case SPONSOR = 'sponsor';

    public function guard(): string
    {
        return RoleGuardEnum::APP->value;
    }
}
