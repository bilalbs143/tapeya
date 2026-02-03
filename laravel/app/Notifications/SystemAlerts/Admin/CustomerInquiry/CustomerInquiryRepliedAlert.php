<?php

namespace App\Notifications\SystemAlerts\Admin\CustomerInquiry;

use App\Models\CustomerInquiry;
use App\Models\CustomerInquiryReply;
use App\Models\User;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class CustomerInquiryRepliedAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(
        public CustomerInquiry $customerInquiry,
        public CustomerInquiryReply $customerInquiryReply
    ) {
        //
    }

    public function toSlack(User $notifiable)
    {
        return $this->customerInquiryReplySlackAlert(
            $this->customerInquiry,
            'customer_inquiry_new_reply',
            $this->customerInquiry?->reply?->creator?->name,
            'replied_by',
            $this->customerInquiryReply,
        );
    }
}
