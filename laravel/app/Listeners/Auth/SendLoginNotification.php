<?php

namespace App\Listeners\Auth;

use App\Events\Auth\LoggedIn;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\LoginAlert;
use App\Utils\Services\NotificationService;

class SendLoginNotification extends BaseListener
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
    public function handle(LoggedIn $event): void
    {
        NotificationService::sendSlackAlert(new LoginAlert($event->user, $event->time));
    }
}
