<?php

namespace App\Enums\Push;

use App\Enums\BaseEnumTrait;

enum PushNotificationStatusEnum: string
{
    use BaseEnumTrait;

    case QUEUED = 'queued';
    case PROCESSING = 'processing';
    case SENT = 'sent';
    case PARTIAL = 'partial';
    case FAILED = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::QUEUED => 'Queued',
            self::PROCESSING => 'Processing',
            self::SENT => 'Sent',
            self::PARTIAL => 'Partial',
            self::FAILED => 'Failed',
        };
    }
}
