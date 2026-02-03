<?php

namespace App\Listeners\Admin\QuickAccountInquiry;

use App\Events\User\QuickAccountInquiry\NewQuickAccountInquiry;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\QuickAccountInquiry\NewQuickAccountInquiryAlert;
use App\Utils\Services\NotificationService;

class SendNewQuickAccountInquiryNotification extends BaseListener
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
    public function handle(NewQuickAccountInquiry $event): void
    {
        NotificationService::sendSlackAlert(new NewQuickAccountInquiryAlert($event->quickAccountInquiry));
    }
}
