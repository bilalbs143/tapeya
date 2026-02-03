<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserRegistered;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\UserRegisteredAlert;
use App\Utils\Services\NotificationService;

class SendUserRegisteredNotification extends BaseListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(UserRegistered $event): void
    {
        NotificationService::sendSlackAlert(new UserRegisteredAlert($event->user));
    }
}
