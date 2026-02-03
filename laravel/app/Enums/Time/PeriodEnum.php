<?php

namespace App\Enums\Time;

use App\Enums\BaseEnumTrait;

enum PeriodEnum: string
{
    use BaseEnumTrait;

    case TODAY = 'today';
    case YESTERDAY = 'yesterday';
    case NOTERDAY = 'noterday';

    public function time()
    {
        return match ($this) {
            self::TODAY => now()->today(),
            self::YESTERDAY => now()->yesterday(),
            self::NOTERDAY => now()->subDays(2),
        };
    }
}
