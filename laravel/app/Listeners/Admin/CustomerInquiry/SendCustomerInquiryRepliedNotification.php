<?php

namespace App\Listeners\Admin\CustomerInquiry;

use App\Events\Admin\CustomerInquiry\CustomerInquiryReplied;
use App\Listeners\BaseListener;
use App\Notifications\SystemAlerts\Admin\CustomerInquiry\CustomerInquiryRepliedAlert;
use App\Utils\Services\NotificationService;

class SendCustomerInquiryRepliedNotification extends BaseListener
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
    public function handle(CustomerInquiryReplied $event): void
    {
        NotificationService::sendSlackAlert(new CustomerInquiryRepliedAlert($event->customerInquiry, $event->customerInquiryReply));
    }
}
