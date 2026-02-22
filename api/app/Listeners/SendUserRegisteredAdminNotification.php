<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Notifications\UserRegisteredAdminNotification;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendUserRegisteredAdminNotification implements ShouldQueue
{
    /**
     * Shared admin inbox: one notification per registration, stored on System user. All admins see the same feed.
     */
    public function handle(UserRegistered $event): void
    {
        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new UserRegisteredAdminNotification($event->user));
        }
    }
}
