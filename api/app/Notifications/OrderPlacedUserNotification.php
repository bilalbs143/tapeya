<?php

namespace App\Notifications;

use App\Models\Shop\Order;
use App\Notifications\Concerns\HasOrderPayload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedUserNotification extends Notification implements ShouldQueue
{
    use HasOrderPayload;
    use Queueable;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Store in database so mobile app NotificationCenter can display it,
        // and also send mail / SMS as before.
        $channels = ['database', 'mail'];
        if ($notifiable->routeNotificationFor('sms')) {
            $channels[] = 'sms';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $orderNumber = $this->order->order_number;

        return (new MailMessage)
            ->subject('Order '.$orderNumber.' confirmed')
            ->view('emails.user.order-placed', $this->orderPayload());
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
            'message' => 'Order '.$orderNumber.' confirmed: '.$totalStr,
        ];
    }
    public function toSms(object $notifiable): string
    {
        $orderNumber = $this->order->order_number;
        $total = $this->order->total.' '.$this->order->currency;

        return 'Your order '.$orderNumber.' has been placed. Total: '.$total.'. Thank you!';
    }
}
