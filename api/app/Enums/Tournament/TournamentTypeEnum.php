<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum TournamentTypeEnum: string
{
    use BaseEnumTrait;

    case LEAGUE = 'league';
    case OPEN_TOURNAMENT = 'open_tournament';
    case EMERGING = 'emerging';

    public function label(): string
    {
        return match ($this) {
            self::LEAGUE => 'League',
            self::OPEN_TOURNAMENT => 'Open Tournament',
            self::EMERGING => 'Emerging',
        };
    }
}
