<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;
use App\Enums\Common\StatusEnum;

/**
 * Calendar phase for a tournament row, derived from {@see Tournament::$start_date} / {@see Tournament::$end_date}
 * and "today" in the app timezone. Separate from {@see StatusEnum} (active / inactive).
 */
enum TournamentScheduleWindowEnum: string
{
    use BaseEnumTrait;

    case UPCOMING = 'upcoming';
    case LIVE = 'live';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::UPCOMING => 'Upcoming',
            self::LIVE => 'Live',
            self::COMPLETED => 'Completed',
        };
    }
}
