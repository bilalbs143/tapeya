<?php

namespace App\Notifications;

use App\Models\Shop\Order;
use Illuminate\Notifications\Notification;

/**
 * In-app (database) notification only, sent synchronously when {@see OrderPlaced} fires so Reverb pushes immediately.
 * Mail/SMS: {@see OrderPlacedUserMailSmsNotification} (queued).
 */
class OrderPlacedUserNotification extends Notification
{
    public function __construct(
        protected Order $order
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Data stored in the database notification for the end user.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->order->loadMissing(['user']);

        $orderNumber = $this->order->order_number;
        $totalStr = (string) $this->order->total.' '.$this->order->currency;
        $customerName = $this->order->user?->name ?? 'You';

        return [
            'type' => 'order_placed',
            'order_id' => $this->order->id,
            'order_number' => $orderNumber,
            'total' => (string) $this->order->total,
            'currency' => $this->order->currency,
            'customer_name' => $customerName,
            'deep_link' => '/shop/orders/'.$this->order->id,
            'message' => 'Order '.$orderNumber.' confirmed: '.$totalStr,
        ];
    }
}
