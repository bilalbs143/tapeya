<?php

namespace App\Enums\Stats;

use App\Enums\BaseEnumTrait;
use App\Enums\Tournament\TournamentTypeEnum;

enum StatsBucketEnum: string
{
    use BaseEnumTrait;

    case OPEN_TOURNAMENT = 'open_tournament';
    case PRIVATE_TOURNAMENT = 'private_tournament';
    case QUICK = 'quick';

    public function label(): string
    {
        return match ($this) {
            self::OPEN_TOURNAMENT => 'Open Tournament',
            self::PRIVATE_TOURNAMENT => 'Private Tournament',
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
        return match ($type) {
            TournamentTypeEnum::OPEN_TOURNAMENT => self::OPEN_TOURNAMENT,
            TournamentTypeEnum::PRIVATE_TOURNAMENT => self::PRIVATE_TOURNAMENT,
        };
    }
}
