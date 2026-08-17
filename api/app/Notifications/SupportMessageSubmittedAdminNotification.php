<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\SupportMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class SupportMessageSubmittedAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected SupportMessage $supportMessage
    ) {}

    /**
     * Database only (admin in-app notification).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $name = $this->supportMessage->name;
        $preview = Str::limit($this->supportMessage->message, 80);
        $message = 'New support message from '.$name.': '.$preview;

        return [
            'type' => AdminNotificationTypeEnum::SUPPORT_MESSAGE_SUBMITTED->value,
            'support_message_id' => $this->supportMessage->id,
            'name' => $name,
            'phone' => $this->supportMessage->phone,
            'message' => $message,
        ];
    }
}
