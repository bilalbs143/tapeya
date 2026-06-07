<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum InningsEndedByEnum: string
{
    use BaseEnumTrait;

    case SYSTEM = 'system';
    case CAPTAIN = 'captain';
    case REFEREE = 'referee';

    public function label(): string
    {
        return match ($this) {
            self::SYSTEM => 'System',
            self::CAPTAIN => 'Captain',
            self::REFEREE => 'Referee',
        };
    }
}
