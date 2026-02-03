<?php

namespace App\Enums\CustomerInquiry;

use App\Enums\BaseEnumTrait;

enum CustomerInquiryStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case RESOLVED = 'resolved';
}
