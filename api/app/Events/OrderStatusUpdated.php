<?php

namespace App\Events;

use App\Enums\Shop\OrderStatusEnum;
use App\Models\Shop\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Order $order,
        public ?OrderStatusEnum $previousStatus = null
    ) {}
}
