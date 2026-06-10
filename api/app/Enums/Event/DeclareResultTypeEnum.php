<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum DeclareResultTypeEnum: string
{
    use BaseEnumTrait;

    case AWARD = 'award';   // one team is declared winner (e.g. match awarded by referee)
    case DRAW = 'draw';     // match ends without a winner (time/weather, mutual agreement)

    public function label(): string
    {
        return match ($this) {
            self::AWARD => 'Match Awarded',
            self::DRAW => 'Draw',
        };
    }
}
