<?php

namespace App\Support\Broadcast;

use App\Services\Broadcast\GraphicFollowUpScheduler;

/**
 * Stable event names for {@see GraphicFollowUpScheduler}.
 */
final class GraphicFollowUpEvent
{
    /** Layer-1 graphic command was taken / activated. */
    public const COMMAND_ACTIVATED = 'graphic.command_activated';

    /** Reserved — toss decision recorded. */
    public const TOSS_COMPLETED = 'match.toss_completed';

    /** Reserved — an innings has closed. */
    public const INNINGS_COMPLETED = 'match.innings_completed';

    /** Reserved — match finished. */
    public const MATCH_COMPLETED = 'match.completed';

    private function __construct() {}
}
