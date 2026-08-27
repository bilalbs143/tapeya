<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum MatchKindEnum: string
{
    use BaseEnumTrait;

    case TOURNAMENT = 'tournament';
    case QUICK = 'quick';

    public function label(): string
    {
        return match ($this) {
            self::TOURNAMENT => 'Tournament',
            self::QUICK => 'Quick Match',
        };
    }
}
