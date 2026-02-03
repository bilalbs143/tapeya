<?php

namespace App\Utils\Services;

use Illuminate\Notifications\Notification;

class NotificationService
{
    public static function sendSlackAlert(Notification $notification)
    {
        $system = SystemSettingsService::getSystemUser();

        $system->notify($notification);
    }
}
