<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum ProductStatusEnum: string
{
    use BaseEnumTrait;

    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PUBLISHED => 'Published',
            self::ARCHIVED => 'Archived',
        };
    }
}
