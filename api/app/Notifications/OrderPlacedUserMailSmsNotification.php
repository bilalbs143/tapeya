<?php

namespace App\Notifications;

use App\Models\Shop\Order;
use App\Notifications\Concerns\HasOrderPayload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Queued email + optional SMS after checkout. In-app notification uses {@see OrderPlacedUserNotification} (sync DB).
 */
class OrderPlacedUserMailSmsNotification extends Notification implements ShouldQueue
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
        $channels = ['mail'];
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

    public function toSms(object $notifiable): string
    {
        $orderNumber = $this->order->order_number;
        $total = $this->order->total.' '.$this->order->currency;

        return 'Your order '.$orderNumber.' has been placed. Total: '.$total.'. Thank you!';
    }
}
