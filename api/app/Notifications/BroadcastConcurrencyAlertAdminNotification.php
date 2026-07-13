<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BroadcastConcurrencyAlertAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected int $concurrentCount,
        protected int $threshold,
    ) {}

    /**
     * Channels: database for System user (admin inbox); mail for AnonymousNotifiable (config admin_emails).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof AnonymousNotifiable) {
            return ['mail'];
        }

        if ($notifiable instanceof User && $notifiable->isSystem()) {
            return ['database'];
        }

        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Tapeya: high concurrent broadcast count')
            ->line("{$this->concurrentCount} YouTube broadcasts are currently starting/live, at or above the alert threshold of {$this->threshold}.")
            ->line('Check the Live Streams list in backoffice for anything that should be ended.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $message = "{$this->concurrentCount} concurrent YouTube broadcasts (threshold: {$this->threshold}).";

        return [
            'type' => AdminNotificationTypeEnum::BROADCAST_CONCURRENCY_HIGH->value,
            'concurrent_count' => $this->concurrentCount,
            'threshold' => $this->threshold,
            'message' => $message,
        ];
    }
}
