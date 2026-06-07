<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum TargetRevisionActionEnum: string
{
    use BaseEnumTrait;

    case CONTINUE = 'continue';
    case END_INNINGS = 'end_innings';

    public function label(): string
    {
        return match ($this) {
            self::CONTINUE => 'Continue Innings',
            self::END_INNINGS => 'End Innings',
        };
    }
}
