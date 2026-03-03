<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserTypeEnum: string
{
    use BaseEnumTrait;

    case SYSTEM = 'system';
    case ADMINISTRATOR = 'administrator';
    case USER = 'user';

    public function label(): string
    {
        return match ($this) {
            self::SYSTEM => 'System',
            self::ADMINISTRATOR => 'Administrator',
            self::USER => 'User',
        };
    }
}
