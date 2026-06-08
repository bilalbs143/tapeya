<?php

namespace App\Enums\Event;

use App\Enums\BaseEnumTrait;

/**
 * Lifecycle status of an innings.
 *
 *   not_started — innings has been created but no balls have been bowled
 *   in_progress — at least one ball has been bowled
 *   completed   — innings has ended (all out, overs bowled, runs chased, or manual end)
 */
enum InningsStatusEnum: string
{
    use BaseEnumTrait;

    case NOT_STARTED = 'not_started';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::NOT_STARTED => 'Not Started',
            self::IN_PROGRESS => 'In Progress',
            self::COMPLETED => 'Completed',
        };
    }

    public function isCompleted(): bool
    {
        return $this === self::COMPLETED;
    }

    public function isInProgress(): bool
    {
        return $this === self::IN_PROGRESS;
    }
}
