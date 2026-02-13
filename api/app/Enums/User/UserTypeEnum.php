<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserTypeEnum: string
{
    use BaseEnumTrait;

    case SYSTEM = 'system';
    case ADMINISTRATOR = 'administrator';
    case USER = 'user';
    case SELLER = 'seller';
}
