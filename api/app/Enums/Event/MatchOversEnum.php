<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Common overs-per-innings options for match setup (e.g. Start Match form).
 */
enum MatchOversEnum: int
{
    use BaseEnumTrait;

    case FIVE = 5;
    case TEN = 10;
    case FIFTEEN = 15;
    case TWENTY = 20;
    case TWENTY_FIVE = 25;
    case THIRTY = 30;
    case FORTY = 40;
    case FIFTY = 50;

    public function label(): string
    {
        return (string) $this->value;
    }
}
