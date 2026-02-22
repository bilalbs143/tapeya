<?php

namespace App\Listeners;

use App\Events\EventCreated;
use App\Notifications\EventCreatedAdminNotification;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendEventCreatedAdminNotification implements ShouldQueue
{
    /**
     * Handle the event: database notification for System user (admin inbox), mail for config admin_emails.
     */
    public function handle(EventCreated $event): void
    {
        $eventModel = $event->event;

        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new EventCreatedAdminNotification($eventModel));
        }

        $configAdminEmails = config('notifications.admin_emails', []);
        if (is_array($configAdminEmails)) {
            foreach ($configAdminEmails as $email) {
                if (is_string($email) && $email !== '') {
                    Notification::route('mail', $email)->notify(new EventCreatedAdminNotification($eventModel));
                }
            }
        }
    }
}
