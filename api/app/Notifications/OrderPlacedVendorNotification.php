<?php

namespace App\Notifications;

use App\Models\Shop\Order;
use App\Models\Shop\VendorOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedVendorNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Order $order,
        protected VendorOrder $vendorOrder,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->order->loadMissing(['user']);
        $number = $this->vendorOrder->vendor_order_number;
        $total = (string) $this->vendorOrder->total.' '.$this->order->currency;

        return (new MailMessage)
            ->subject('New order '.$number)
            ->line('You have a new marketplace order.')
            ->line('Vendor order: '.$number)
            ->line('Buyer share total: '.$total)
            ->line('Ship to: '.$this->order->address.', '.$this->order->city.', '.$this->order->country);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_placed',
            'order_id' => $this->order->id,
            'order_number' => $this->vendorOrder->vendor_order_number,
            'vendor_order_id' => $this->vendorOrder->id,
            'vendor_order_number' => $this->vendorOrder->vendor_order_number,
            'total' => (string) $this->vendorOrder->total,
            'currency' => $this->order->currency,
            'deep_link' => '/seller/orders/'.$this->vendorOrder->id,
            'message' => 'New order '.$this->vendorOrder->vendor_order_number.' ('.$this->vendorOrder->total.' '.$this->order->currency.')',
        ];
    }
}
