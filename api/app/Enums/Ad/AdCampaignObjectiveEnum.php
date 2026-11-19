<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum AdCampaignObjectiveEnum: string
{
    use BaseEnumTrait;

    case Awareness = 'awareness';
    case Traffic = 'traffic';
    case Engagement = 'engagement';

    public function label(): string
    {
        return match ($this) {
            self::Awareness => 'Awareness',
            self::Traffic => 'Traffic',
            self::Engagement => 'Engagement',
        };
    }
}
