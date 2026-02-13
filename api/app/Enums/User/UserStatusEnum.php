<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserStatusEnum: string
{
    use BaseEnumTrait;

    case VERIFICATION_PENDING = 'verification_pending';
    case ACTIVE = 'active';
    case BLOCKED = 'blocked';
}
