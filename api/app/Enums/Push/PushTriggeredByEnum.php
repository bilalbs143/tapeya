<?php

namespace App\Enums\Push;

use App\Enums\BaseEnumTrait;

enum PushTriggeredByEnum: string
{
    use BaseEnumTrait;

    case SYSTEM = 'system';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::SYSTEM => 'System',
            self::ADMIN => 'Manual (Admin)',
        };
    }
}
