<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum VendorStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case APPROVED = 'approved';
    case SUSPENDED = 'suspended';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::APPROVED => 'Approved',
            self::SUSPENDED => 'Suspended',
            self::REJECTED => 'Rejected',
        };
    }
}
