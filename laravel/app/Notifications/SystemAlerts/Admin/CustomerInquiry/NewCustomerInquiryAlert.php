<?php

namespace App\Notifications\SystemAlerts\Admin\CustomerInquiry;

use App\Models\CustomerInquiry;
use App\Models\User;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class NewCustomerInquiryAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public CustomerInquiry $customerInquiry)
    {
        //
    }

    public function toSlack(User $notifiable)
    {
        return $this->customerInquirySlackAlert($this->customerInquiry, 'new_customer_inquiry_received', $this->customerInquiry->creator?->name, 'submitted_by');
    }
}
