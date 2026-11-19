<?php

namespace App\Enums\Ad;

use App\Enums\BaseEnumTrait;

enum AdCreativeStatusEnum: string
{
    use BaseEnumTrait;

    case PendingReview = 'pending_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Paused = 'paused';

    public function label(): string
    {
        return match ($this) {
            self::PendingReview => 'Pending review',
            self::Approved => 'Approved',
            self::Rejected => 'Rejected',
            self::Paused => 'Paused',
        };
    }
}
