<?php

namespace App\Notifications;

use App\Enums\Shop\OrderStatusEnum;
use App\Models\Shop\Order;
use Illuminate\Notifications\Notification;

/**
 * In-app notification only (no ShouldQueue) so {@see NotificationSent} runs immediately and
 * {@see BroadcastUserDatabaseNotification} can push to Reverb in the same process as the admin update.
 * Email is sent via {@see OrderStatusUpdatedUserMailNotification} (queued).
 */
class OrderStatusUpdatedUserNotification extends Notification
{
    public function __construct(
        protected Order $order,
        protected ?OrderStatusEnum $previousStatus = null
    ) {
        $this->order = $order;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
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
}
