<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

abstract class BaseNotification extends Notification implements ShouldQueue
{
    use BaseNotificationTrait, Queueable;

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(User $notifiable): array
    {
        $via = ['database'];
        if (env('SLACK_BOT_USER_OAUTH_TOKEN')) {
            $via[] = 'slack';
        }

        return $via;
    }
}
