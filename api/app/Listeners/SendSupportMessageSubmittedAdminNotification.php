<?php

namespace App\Listeners;

use App\Events\SupportMessageSubmitted;
use App\Notifications\SupportMessageSubmittedAdminNotification;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendSupportMessageSubmittedAdminNotification implements ShouldQueue
{
    /**
     * Shared admin inbox: one notification per support message, stored on System user. All admins see the same feed.
     */
    public function handle(SupportMessageSubmitted $event): void
    {
        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new SupportMessageSubmittedAdminNotification($event->supportMessage));
        }
    }
}
