<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum EventRequestStatusEnum: string
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
}
