<?php

namespace App\Listeners\Admin\CustomerInquiry;

use App\Events\User\CustomerInquiry\NewCustomerInquiry;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\CustomerInquiry\NewCustomerInquiryAlert;
use App\Utils\Services\NotificationService;

class SendNewCustomerInquiryNotification extends BaseListener
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
    public function handle(NewCustomerInquiry $event): void
    {
        NotificationService::sendSlackAlert(new NewCustomerInquiryAlert($event->customerInquiry));
    }
}
