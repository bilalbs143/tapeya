<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * What the toss winner chose: bat first or bowl first.
 */
enum TossChoiceEnum: string
{
    use BaseEnumTrait;

    case BAT = 'bat';
    case BOWL = 'bowl';

    public function label(): string
    {
        return match ($this) {
            self::BAT => 'Bat',
            self::BOWL => 'Bowl',
        };
    }
}
