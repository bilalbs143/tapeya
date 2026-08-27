<?php

namespace App\Enums\Stats;

use App\Enums\BaseEnumTrait;
use App\Enums\Tournament\TournamentTypeEnum;

enum StatsBucketEnum: string
{
    use BaseEnumTrait;

    case LEAGUE = 'league';
    case OPEN_TOURNAMENT = 'open_tournament';
    case EMERGING = 'emerging';
    case QUICK = 'quick';

    public function label(): string
    {
        return match ($this) {
            self::LEAGUE => 'League',
            self::OPEN_TOURNAMENT => 'Open Tournament',
            self::EMERGING => 'Emerging',
            self::QUICK => 'Quick',
        };
    }

    public function isQuick(): bool
    {
        return $this === self::QUICK;
    }

    public function isTournamentBucket(): bool
    {
        return ! $this->isQuick();
    }

    public static function fromTournamentType(TournamentTypeEnum $type): self
    {
        return self::from($type->value);
    }
}
