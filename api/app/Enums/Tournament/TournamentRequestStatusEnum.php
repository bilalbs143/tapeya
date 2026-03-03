<?php

namespace App\Enums\Tournament;

use App\Enums\BaseEnumTrait;

enum TournamentRequestStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
        };
    }
}
