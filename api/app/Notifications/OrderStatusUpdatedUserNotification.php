<?php

namespace App\Notifications;

use App\Enums\Shop\OrderStatusEnum;
use App\Models\Shop\Order;
use App\Notifications\Concerns\HasOrderPayload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedUserNotification extends Notification implements ShouldQueue
{
    use HasOrderPayload;
    use Queueable;

    public function __construct(
        protected Order $order,
        protected ?OrderStatusEnum $previousStatus = null
    ) {
        $this->order = $order;
    }

    /**
     * Channels: database + mail only.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
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
     * Data stored in the database notification for the user.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->order->loadMissing(['user']);

        $orderNumber = $this->order->order_number;
        $statusLabel = $this->order->status?->label() ?? 'updated';
        $customerName = $this->order->user?->name ?? 'You';

        $message = 'Order '.$orderNumber.' status updated to '.$statusLabel.'.';
        if ($this->previousStatus !== null) {
            $message = 'Order '.$orderNumber.' status changed from '.$this->previousStatus->label().' to '.$statusLabel.'.';
        }

        return [
            'type' => 'order_status_updated',
            'order_id' => $this->order->id,
            'order_number' => $orderNumber,
            'status' => $this->order->status?->value,
            'status_label' => $statusLabel,
            'previous_status' => $this->previousStatus?->value,
            'customer_name' => $customerName,
            'message' => $message,
        ];
    }

    /**
     * Payload for order-status-updated email view (order + status info).
     *
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
