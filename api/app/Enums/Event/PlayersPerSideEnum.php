<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Players per side (wickets) options for match setup.
 */
enum PlayersPerSideEnum: int
{
    use BaseEnumTrait;

    case TWO = 2;
    case THREE = 3;
    case FOUR = 4;
    case FIVE = 5;
    case ELEVEN = 11;

    public function label(): string
    {
        return (string) $this->value;
    }
}
