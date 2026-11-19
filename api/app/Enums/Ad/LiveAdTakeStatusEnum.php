<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum LiveAdTakeStatusEnum: string
{
    use BaseEnumTrait;

    case Draft = 'draft';
    case Live = 'live';
    case Ended = 'ended';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Live => 'Live',
            self::Ended => 'Ended',
            self::Cancelled => 'Cancelled',
        };
    }
}
