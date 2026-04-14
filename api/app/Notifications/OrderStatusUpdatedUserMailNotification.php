<?php

namespace App\Notifications;

use App\Enums\Shop\OrderStatusEnum;
use App\Models\Shop\Order;
use App\Notifications\Concerns\HasOrderPayload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Queued email only. Database + realtime push use {@see OrderStatusUpdatedUserNotification}.
 */
class OrderStatusUpdatedUserMailNotification extends Notification implements ShouldQueue
{
    use HasOrderPayload;
    use Queueable;

    public function __construct(
        Order $order,
        protected ?OrderStatusEnum $previousStatus = null
    ) {
        $this->order = $order;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $orderNumber = $this->order->order_number;
        $statusLabel = $this->order->status?->label() ?? 'Updated';

        return (new MailMessage)
            ->subject('Order '.$orderNumber.' status: '.$statusLabel)
            ->view('emails.user.order-status-updated', $this->orderStatusPayload());
    }

    /**
     * @return array<string, mixed>
     */
    protected function orderStatusPayload(): array
    {
        $base = $this->orderPayload();
        $base['statusLabel'] = $this->order->status?->label() ?? 'Updated';
        $base['previousStatusLabel'] = $this->previousStatus?->label();

        return $base;
    }
}
