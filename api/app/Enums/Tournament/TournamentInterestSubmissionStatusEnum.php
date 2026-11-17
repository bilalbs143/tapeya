<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum TournamentInterestSubmissionStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::CONFIRMED => 'Confirmed',
        };
    }
}
