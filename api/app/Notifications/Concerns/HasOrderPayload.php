<?php

namespace App\Notifications\Concerns;

use App\Models\Shop\Order;

trait HasOrderPayload
{
    protected Order $order;

    /**
     * Shared payload for order email/SMS templates (user & admin).
     *
     * @return array<string, mixed>
     */
    protected function orderPayload(): array
    {
        $this->order->loadMissing(['user', 'items']);

        return [
            'order' => $this->order,
            'orderNumber' => $this->order->order_number,
            'total' => $this->order->total.' '.$this->order->currency,
            'customerName' => $this->order->user?->name ?? 'Guest',
            'customerEmail' => $this->order->user?->email ?? '-',
            'customerPhone' => $this->order->user?->phone ?? '-',
            'address' => $this->order->address,
            'city' => $this->order->city,
            'country' => $this->order->country,
            'items' => $this->order->items,
            'subtotal' => $this->order->subtotal,
            'shippingAmount' => $this->order->shipping_amount,
            'currency' => $this->order->currency,
        ];
    }
}
