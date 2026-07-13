<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class YouTubeQuotaAlertAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected int $usedUnits,
        protected int $budgetUnits,
        protected int $percentUsed,
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
            ->subject('Tapeya: YouTube API quota running high')
            ->line("Today's tracked YouTube Data API usage is {$this->usedUnits}/{$this->budgetUnits} units ({$this->percentUsed}%).")
            ->line('If this keeps climbing, live streaming (create/end/sync) may start failing once the daily quota is exhausted. Check Google Cloud Console for the actual remaining quota.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $message = "YouTube API quota at {$this->percentUsed}% ({$this->usedUnits}/{$this->budgetUnits} units) today.";

        return [
            'type' => AdminNotificationTypeEnum::YOUTUBE_QUOTA_HIGH->value,
            'used_units' => $this->usedUnits,
            'budget_units' => $this->budgetUnits,
            'percent_used' => $this->percentUsed,
            'message' => $message,
        ];
    }
}
