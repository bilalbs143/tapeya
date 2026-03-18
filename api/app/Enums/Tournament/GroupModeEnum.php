<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum GroupModeEnum: string
{
    use BaseEnumTrait;

    case OPEN = 'open';
    case GROUP_WISE = 'group_wise';

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Open Group',
            self::GROUP_WISE => 'Group Wise',
        };
    }
}
