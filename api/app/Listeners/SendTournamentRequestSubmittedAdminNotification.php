<?php

namespace App\Listeners;

use App\Events\TournamentRequestSubmitted;
use App\Notifications\TournamentRequestSubmittedAdminNotification;
use App\Settings\AdminNotificationSettings;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendTournamentRequestSubmittedAdminNotification implements ShouldQueue
{
    public function __construct(private readonly AdminNotificationSettings $adminNotificationSettings) {}

    /**
     * Database notification for System user (admin inbox) + mail to admin_emails system setting.
     */
    public function handle(TournamentRequestSubmitted $event): void
    {
        $tournamentRequest = $event->tournamentRequest;

        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new TournamentRequestSubmittedAdminNotification($tournamentRequest));
        }

        $configAdminEmails = $this->adminNotificationSettings->adminEmails;
        if (is_array($configAdminEmails)) {
            foreach ($configAdminEmails as $email) {
                if (is_string($email) && $email !== '') {
                    Notification::route('mail', $email)->notify(new TournamentRequestSubmittedAdminNotification($tournamentRequest));
                }
            }
        }
    }
}
