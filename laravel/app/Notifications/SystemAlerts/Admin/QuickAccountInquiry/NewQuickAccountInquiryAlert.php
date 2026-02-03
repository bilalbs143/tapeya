<?php

namespace App\Notifications\SystemAlerts\Admin\QuickAccountInquiry;

use App\Models\QuickAccountInquiry;
use App\Models\User;
use App\Notifications\SystemAlerts\BaseSystemAlert;

class NewQuickAccountInquiryAlert extends BaseSystemAlert
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public QuickAccountInquiry $quickAccountInquiry)
    {
        //
    }

    public function toSlack(User $notifiable)
    {
        return $this->quickAccountInquirySlackAlert($this->quickAccountInquiry, 'new_quick_account_inquiry_received', $this->quickAccountInquiry->creator?->name, 'submitted_by');
    }
}
