<?php

namespace App\Services\Shop;

use App\Enums\Shop\OrderStatusEnum;
use InvalidArgumentException;

class OrderStatusAggregator
{
    /**
     * @param  list<OrderStatusEnum|string>  $statuses
     */
    public function fromVendorStatuses(array $statuses): OrderStatusEnum
    {
        if ($statuses === []) {
            throw new InvalidArgumentException('Vendor statuses list must be non-empty.');
        }

        $normalized = array_map(
            fn ($s) => $s instanceof OrderStatusEnum ? $s : OrderStatusEnum::from((string) $s),
            $statuses
        );

        $allCancelled = true;
        foreach ($normalized as $status) {
            if ($status !== OrderStatusEnum::CANCELLED) {
                $allCancelled = false;
                break;
            }
        }
        if ($allCancelled) {
            return OrderStatusEnum::CANCELLED;
        }

        $active = array_values(array_filter(
            $normalized,
            fn (OrderStatusEnum $s) => $s !== OrderStatusEnum::CANCELLED
        ));

        $allDelivered = true;
        foreach ($active as $status) {
            if ($status !== OrderStatusEnum::DELIVERED) {
                $allDelivered = false;
                break;
            }
        }
        if ($allDelivered) {
            return OrderStatusEnum::DELIVERED;
        }

        $hasPendingOrProcessing = false;
        foreach ($active as $status) {
            if ($status === OrderStatusEnum::PENDING || $status === OrderStatusEnum::PROCESSING) {
                $hasPendingOrProcessing = true;
                break;
            }
        }

        if ($hasPendingOrProcessing) {
            $allPending = true;
            foreach ($active as $status) {
                if ($status !== OrderStatusEnum::PENDING) {
                    $allPending = false;
                    break;
                }
            }

            return $allPending ? OrderStatusEnum::PENDING : OrderStatusEnum::PROCESSING;
        }

        foreach ($active as $status) {
            if ($status === OrderStatusEnum::DISPATCHED) {
                return OrderStatusEnum::DISPATCHED;
            }
        }

        return OrderStatusEnum::DELIVERED;
    }
}
