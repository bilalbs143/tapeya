<?php

namespace App\Enums\Push;

use App\Enums\BaseEnumTrait;

enum PushTargetTypeEnum: string
{
    use BaseEnumTrait;

    case ALL = 'all';
    case USER = 'user';

    public function label(): string
    {
        return match ($this) {
            self::ALL => 'All Users',
            self::USER => 'Single User',
        };
    }
}
