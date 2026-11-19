<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum AdCampaignStatusEnum: string
{
    use BaseEnumTrait;

    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case Active = 'active';
    case Paused = 'paused';
    case Ended = 'ended';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Scheduled => 'Scheduled',
            self::Active => 'Active',
            self::Paused => 'Paused',
            self::Ended => 'Ended',
        };
    }
}
