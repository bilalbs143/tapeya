<?php

namespace App\Enums\User;

use App\Contracts\RoleEnumInterface;
use App\Enums\BaseEnumTrait;

/**
 * Roles for app users (type=user). Player, organizer, sponsor.
 *
 * Broadcast staff use the app Organizer role (see {@see EnsuresTournamentStaffAppRoles})
 * plus {@see AdminRoleEnum::BROADCASTER} and/or the tournament_broadcaster pivot — not a separate app slug.
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

    public function label(): string
    {
        return match ($this) {
            self::PLAYER => 'Player',
            self::ORGANIZER => 'Organizer',
            self::SPONSOR => 'Sponsor',
        };
    }
}
