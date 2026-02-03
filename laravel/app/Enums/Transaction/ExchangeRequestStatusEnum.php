<?php

namespace App\Enums\Transaction;

use App\Enums\BaseEnumTrait;

enum ExchangeRequestStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case PENDING_VERIFICATION = 'pending_verification';
    case VERIFIED = 'verified';
    case PROCESSING = 'processing';
    // case COMPLETED = 'completed'; // removed this as we will use approved everywhere in system
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
}
