<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum BrandPartnerStatusEnum: string
{
    use BaseEnumTrait;

    case Draft = 'draft';
    case Active = 'active';
    case Paused = 'paused';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Active => 'Active',
            self::Paused => 'Paused',
            self::Archived => 'Archived',
        };
    }
}
