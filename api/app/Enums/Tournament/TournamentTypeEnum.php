<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum TournamentTypeEnum: string
{
    use BaseEnumTrait;

    case OPEN_TOURNAMENT = 'open_tournament';
    case PRIVATE_TOURNAMENT = 'private_tournament';

    public function label(): string
    {
        return match ($this) {
            self::OPEN_TOURNAMENT => 'Open Tournament',
            self::PRIVATE_TOURNAMENT => 'Private Tournament',
        };
    }

    public function isPublic(): bool
    {
        return $this === self::OPEN_TOURNAMENT;
    }
}
