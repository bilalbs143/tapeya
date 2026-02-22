<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\Shop\Order;
use App\Models\User;
use App\Notifications\Concerns\HasOrderPayload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedAdminNotification extends Notification implements ShouldQueue
{
    use HasOrderPayload;
    use Queueable;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Channels: mail + database for admin User (mail only if user has email); mail only for anonymous (config admin_emails).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof AnonymousNotifiable) {
            return ['mail'];
        }

        // System user = shared admin inbox: database only (no mail to system).
        if ($notifiable instanceof User && $notifiable->isSystem()) {
            return ['database'];
        }

        $channels = ['database'];
        if (! empty($notifiable->email)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $orderNumber = $this->order->order_number;

        return (new MailMessage)
            ->subject('New order received: '.$orderNumber)
            ->view('emails.admin.order-placed', $this->orderPayload());
    }

    /**
     * Data stored in the database notification (for in-app / API listing).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->order->loadMissing(['user']);

        $customerName = $this->order->user?->name ?? 'Guest';
        $totalStr = (string) $this->order->total.' '.$this->order->currency;
        $message = 'New order '.$this->order->order_number.' from '.$customerName.' — '.$totalStr;

        return [
            'type' => AdminNotificationTypeEnum::ORDER_PLACED->value,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total' => (string) $this->order->total,
            'currency' => $this->order->currency,
            'customer_name' => $customerName,
            'message' => $message,
        ];
    }
}
