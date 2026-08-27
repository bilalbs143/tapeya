<?php

namespace App\Enums\Support;

use App\Enums\BaseEnumTrait;

enum SupportMessageStatusEnum: string
{
    use BaseEnumTrait;

    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case RESOLVED = 'resolved';

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Open',
            self::IN_PROGRESS => 'In Progress',
            self::RESOLVED => 'Resolved',
        };
    }
}
