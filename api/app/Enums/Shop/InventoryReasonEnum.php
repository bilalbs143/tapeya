<?php

namespace App\Enums\Shop;

use App\Enums\BaseEnumTrait;

enum InventoryReasonEnum: string
{
    use BaseEnumTrait;

    case SALE = 'sale';
    case CANCEL_RESTORE = 'cancel_restore';
    case RESTOCK = 'restock';
    case ADMIN_ADJUST = 'admin_adjust';
    case MANUAL = 'manual';

    public function label(): string
    {
        return match ($this) {
            self::SALE => 'Sale',
            self::CANCEL_RESTORE => 'Cancel Restore',
            self::RESTOCK => 'Restock',
            self::ADMIN_ADJUST => 'Admin Adjust',
            self::MANUAL => 'Manual',
        };
    }
}
