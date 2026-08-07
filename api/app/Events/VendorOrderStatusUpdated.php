<?php

namespace App\Events;

use App\Enums\Shop\OrderStatusEnum;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VendorOrderStatusUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public VendorOrder $vendorOrder,
        public OrderStatusEnum $previousStatus,
        public ?User $actor = null,
    ) {}
}
