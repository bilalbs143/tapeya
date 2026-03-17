<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

enum MatchStatusEnum: string
{
    use BaseEnumTrait;

    case SCHEDULED = 'scheduled';
    case TOSS_DONE = 'toss_done';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::SCHEDULED => 'Scheduled',
            self::TOSS_DONE => 'Toss done',
            self::IN_PROGRESS => 'In progress',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
        };
    }
}
