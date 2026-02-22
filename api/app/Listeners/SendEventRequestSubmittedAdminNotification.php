<?php

namespace App\Listeners;

use App\Events\EventRequestSubmitted;
use App\Notifications\EventRequestSubmittedAdminNotification;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendEventRequestSubmittedAdminNotification implements ShouldQueue
{
    /**
     * Database notification for System user (admin inbox) + mail to config admin_emails.
     */
    public function handle(EventRequestSubmitted $event): void
    {
        $eventRequest = $event->eventRequest;

        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new EventRequestSubmittedAdminNotification($eventRequest));
        }

        $configAdminEmails = config('notifications.admin_emails', []);
        if (is_array($configAdminEmails)) {
            foreach ($configAdminEmails as $email) {
                if (is_string($email) && $email !== '') {
                    Notification::route('mail', $email)->notify(new EventRequestSubmittedAdminNotification($eventRequest));
                }
            }
        }
    }
}
