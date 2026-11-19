<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;

enum PostDistributionEnum: string
{
    use BaseEnumTrait;

    case Organic = 'organic';
    case SponsoredOnly = 'sponsored_only';

    public function label(): string
    {
        return match ($this) {
            self::Organic => 'Organic',
            self::SponsoredOnly => 'Sponsored only',
        };
    }
}
