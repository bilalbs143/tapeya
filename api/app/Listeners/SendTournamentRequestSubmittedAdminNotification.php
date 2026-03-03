<?php

namespace App\Listeners;

use App\Events\TournamentRequestSubmitted;
use App\Notifications\TournamentRequestSubmittedAdminNotification;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendTournamentRequestSubmittedAdminNotification implements ShouldQueue
{
    /**
     * Database notification for System user (admin inbox) + mail to config admin_emails.
     */
    public function handle(TournamentRequestSubmitted $event): void
    {
        $tournamentRequest = $event->tournamentRequest;

        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new TournamentRequestSubmittedAdminNotification($tournamentRequest));
        }

        $configAdminEmails = config('notifications.admin_emails', []);
        if (is_array($configAdminEmails)) {
            foreach ($configAdminEmails as $email) {
                if (is_string($email) && $email !== '') {
                    Notification::route('mail', $email)->notify(new TournamentRequestSubmittedAdminNotification($tournamentRequest));
                }
            }
        }
    }
}
