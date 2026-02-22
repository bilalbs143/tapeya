<?php

namespace App\Notifications;

use App\Enums\Notification\AdminNotificationTypeEnum;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class UserRegisteredAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected User $user
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
        $name = $this->user->name;
        $phone = $this->user->phone ?? '-';
        $message = 'New user registered: '.$name.' (phone: '.$phone.')';

        return [
            'type' => AdminNotificationTypeEnum::USER_REGISTERED->value,
            'user_id' => $this->user->id,
            'user_name' => $name,
            'user_email' => $this->user->email,
            'user_phone' => $this->user->phone,
            'message' => $message,
        ];
    }
}
