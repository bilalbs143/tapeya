<?php

namespace App\Services\Shop;

use App\Enums\Shop\InventoryReasonEnum;
use App\Enums\Shop\OrderStatusEnum;
use App\Enums\Shop\PaymentStatusEnum;
use App\Events\OrderStatusUpdated;
use App\Events\VendorOrderStatusUpdated;
use App\Models\Shop\Order;
use App\Models\Shop\Product;
use App\Models\Shop\VendorOrder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class VendorOrderStatusService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly OrderStatusAggregator $aggregator,
    ) {}

    /**
     * @return array{vendor_order: VendorOrder, parent: Order, parent_changed: bool}
     */
    public function transition(
        VendorOrder $vendorOrder,
        OrderStatusEnum $to,
        ?User $actor = null,
        bool $asAdmin = false,
    ): array {
        return DB::transaction(function () use ($vendorOrder, $to, $actor, $asAdmin) {
            return $this->applyTransition($vendorOrder->id, $to, $actor, $asAdmin);
        });
    }

    /**
     * Apply the same status to every vendor-order on a parent (Phase 0 admin convenience).
     *
     * @return array{parent: Order, parent_changed: bool}
     */
    public function transitionParent(Order $order, OrderStatusEnum $to, ?User $actor = null): array
    {
        return DB::transaction(function () use ($order, $to, $actor) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $previousParentStatus = $order->status;

            $vendorOrderIds = VendorOrder::query()
                ->where('order_id', $order->id)
                ->orderBy('id')
                ->lockForUpdate()
                ->pluck('id');

            if ($vendorOrderIds->isEmpty()) {
                throw new RuntimeException('Order has no vendor orders.');
            }

            foreach ($vendorOrderIds as $vendorOrderId) {
                $this->applyTransition((int) $vendorOrderId, $to, $actor, asAdmin: true);
            }

            $parent = $order->fresh(['items', 'vendorOrders', 'user']);

            return [
                'parent' => $parent,
                'parent_changed' => $previousParentStatus !== $parent->status,
            ];
        });
    }

    /**
     * Buyer cancel: only when every vendor-order is still pending.
     *
     * @return array{parent: Order, parent_changed: bool}
     */
    public function cancelByBuyer(Order $order, ?User $actor = null): array
    {
        return DB::transaction(function () use ($order, $actor) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            $vendorOrders = VendorOrder::query()
                ->where('order_id', $order->id)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            if ($vendorOrders->isEmpty()) {
                throw new RuntimeException('Order has no vendor orders.');
            }

            if (in_array($order->payment_status, [
                PaymentStatusEnum::PAID,
                PaymentStatusEnum::ADVANCE,
            ], true)) {
                throw new InvalidArgumentException(
                    'Orders with recorded payment cannot be cancelled. Contact support for a refund.'
                );
            }

            foreach ($vendorOrders as $vo) {
                if ($vo->status !== OrderStatusEnum::PENDING) {
                    throw new InvalidArgumentException(
                        'Order can only be cancelled while all vendor orders are still pending.'
                    );
                }
            }

            $previousParentStatus = $order->status;

            foreach ($vendorOrders as $vo) {
                $this->applyTransition((int) $vo->id, OrderStatusEnum::CANCELLED, $actor, asAdmin: true);
            }

            $parent = $order->fresh(['items', 'vendorOrders', 'user']);

            return [
                'parent' => $parent,
                'parent_changed' => $previousParentStatus !== $parent->status,
            ];
        });
    }

    /**
     * @return array{vendor_order: VendorOrder, parent: Order, parent_changed: bool}
     */
    private function applyTransition(
        int $vendorOrderId,
        OrderStatusEnum $to,
        ?User $actor,
        bool $asAdmin,
    ): array {
        $vendorOrder = VendorOrder::query()->whereKey($vendorOrderId)->lockForUpdate()->firstOrFail();
        $from = $vendorOrder->status;

        if ($from === $to) {
            $parent = Order::query()->whereKey($vendorOrder->order_id)->lockForUpdate()->firstOrFail();

            return [
                'vendor_order' => $vendorOrder,
                'parent' => $parent,
                'parent_changed' => false,
            ];
        }

        if (! $this->isAllowed($from, $to, $asAdmin)) {
            throw new InvalidArgumentException(
                "Cannot transition vendor order from {$from->value} to {$to->value}."
            );
        }

        if ($to === OrderStatusEnum::CANCELLED && $from !== OrderStatusEnum::CANCELLED) {
            $this->restoreStockForVendorOrder($vendorOrder, $actor);
        }

        $vendorOrder->status = $to;
        $vendorOrder->save();

        $parent = Order::query()->whereKey($vendorOrder->order_id)->lockForUpdate()->firstOrFail();
        $previousParentStatus = $parent->status;
        $statuses = VendorOrder::query()
            ->where('order_id', $parent->id)
            ->pluck('status')
            ->all();
        $aggregate = $this->aggregator->fromVendorStatuses($statuses);
        $parentChanged = $parent->status !== $aggregate;
        if ($parentChanged) {
            $parent->status = $aggregate;
            $parent->save();
        }

        $freshVendorOrder = $vendorOrder->fresh(['vendor', 'order']);
        event(new VendorOrderStatusUpdated($freshVendorOrder, $from, $actor));

        if ($parentChanged) {
            event(new OrderStatusUpdated($parent->fresh(['user']), $previousParentStatus));
        }

        return [
            'vendor_order' => $freshVendorOrder,
            'parent' => $parent->fresh(),
            'parent_changed' => $parentChanged,
        ];
    }

    private function isAllowed(OrderStatusEnum $from, OrderStatusEnum $to, bool $asAdmin): bool
    {
        $map = [
            OrderStatusEnum::PENDING->value => [
                OrderStatusEnum::PROCESSING,
                OrderStatusEnum::CANCELLED,
            ],
            OrderStatusEnum::PROCESSING->value => [
                OrderStatusEnum::DISPATCHED,
                OrderStatusEnum::CANCELLED,
            ],
            OrderStatusEnum::DISPATCHED->value => [
                OrderStatusEnum::DELIVERED,
                OrderStatusEnum::CANCELLED,
            ],
        ];

        $allowed = $map[$from->value] ?? [];
        if (! in_array($to, $allowed, true)) {
            return false;
        }

        if (! $asAdmin && $from === OrderStatusEnum::DISPATCHED && $to === OrderStatusEnum::CANCELLED) {
            return false;
        }

        return true;
    }

    private function restoreStockForVendorOrder(VendorOrder $vendorOrder, ?User $actor): void
    {
        $items = $vendorOrder->items()->get();
        $productIds = $items->pluck('product_id')->filter()->unique()->sort()->values()->all();
        $products = Product::query()
            ->whereIn('id', $productIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item->product_id);
            if (! $product) {
                continue;
            }
            $this->inventory->restore(
                $product,
                (int) $item->quantity,
                InventoryReasonEnum::CANCEL_RESTORE,
                $item,
                $actor,
            );
        }
    }
}
