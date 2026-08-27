<?php

namespace App\Listeners;

use App\Events\VendorApplicationSubmitted;
use App\Notifications\VendorApplicationSubmittedAdminNotification;
use App\Utils\Services\SystemUserService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendVendorApplicationSubmittedAdminNotification implements ShouldQueue
{
    /**
     * Shared admin inbox: one notification per seller application, stored on System user.
     */
    public function handle(VendorApplicationSubmitted $event): void
    {
        $systemUser = SystemUserService::get();
        if ($systemUser) {
            $systemUser->notify(new VendorApplicationSubmittedAdminNotification($event->vendor));
        }
    }
}
