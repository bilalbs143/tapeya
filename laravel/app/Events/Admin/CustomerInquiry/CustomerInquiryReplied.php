<?php

namespace App\Events\Admin\CustomerInquiry;

use App\Events\BaseEvent;
use App\Models\CustomerInquiry;
use App\Models\CustomerInquiryReply;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\Attributes\WithoutRelations;

class CustomerInquiryReplied extends BaseEvent
{
    /**
     * Create a new event instance.
     */
    public function __construct(
        #[WithoutRelations] public CustomerInquiry $customerInquiry,
        #[WithoutRelations] public CustomerInquiryReply $customerInquiryReply
    ) {}

    public function castTo(): Collection|User|array|null
    {
        return [
            $this->customerInquiry?->creator,
            $this->customerInquiryReply?->creator,
        ];
    }
}
