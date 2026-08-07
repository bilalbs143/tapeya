<?php

namespace App\Notifications;

use App\Events\VendorOrderStatusUpdated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorOrderStatusUpdatedVendorNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected VendorOrderStatusUpdated $event,
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
        $vo = $this->event->vendorOrder;
        $label = $vo->status?->label() ?? $vo->status?->value;

        return (new MailMessage)
            ->subject('Order '.$vo->vendor_order_number.' → '.$label)
            ->line('Your vendor order status was updated.')
            ->line('Order: '.$vo->vendor_order_number)
            ->line('New status: '.$label);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $vo = $this->event->vendorOrder;
        $statusLabel = $vo->status?->label() ?? $vo->status?->value;

        return [
            'type' => 'order_status_updated',
            'vendor_order_id' => $vo->id,
            'order_id' => $vo->order_id,
            'order_number' => $vo->vendor_order_number,
            'vendor_order_number' => $vo->vendor_order_number,
            'status' => $vo->status?->value,
            'status_label' => $statusLabel,
            'previous_status' => $this->event->previousStatus->value,
            'deep_link' => '/seller/orders/'.$vo->id,
            'message' => 'Order '.$vo->vendor_order_number.' is now '.$statusLabel,
        ];
    }
}
