<?php

namespace App\Notifications\SystemAlerts;

use App\Models\User;
use App\Notifications\BaseNotificationTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

abstract class BaseSystemAlert extends Notification implements ShouldQueue
{
    use BaseNotificationTrait, BaseSystemAlertTrait, Queueable;

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(User $notifiable): array
    {
        $via = [];

        if (env('SLACK_BOT_USER_OAUTH_TOKEN')) {
            $via[] = 'slack';
        }

        return $via;
    }
}
