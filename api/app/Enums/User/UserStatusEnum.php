<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserStatusEnum: string
{
    use BaseEnumTrait;

    case VERIFICATION_PENDING = 'verification_pending';
    case ACTIVE = 'active';
    case BLOCKED = 'blocked';

    public function label(): string
    {
        return match ($this) {
            self::VERIFICATION_PENDING => 'Verification Pending',
            self::ACTIVE => 'Active',
            self::BLOCKED => 'Blocked',
        };
    }
}
