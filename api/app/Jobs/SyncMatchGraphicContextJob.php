<?php

namespace App\Jobs;

use App\Models\TournamentMatch;
use App\Services\Broadcast\GraphicContextOrchestrator;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Recomputes the live graphic session context after every ball mutation and
 * immediately re-broadcasts the active command so the overlay reflects the
 * current scorecard in real time.
 *
 * ShouldBeUnique ensures that if many balls arrive in quick succession only
 * one job per match is queued at a time, avoiding redundant context rebuilds
 * and double-broadcast noise on the overlay.
 */
class SyncMatchGraphicContextJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $matchId) {}

    /** One unique job slot per match at a time. */
    public function uniqueId(): string
    {
        return (string) $this->matchId;
    }

    public function handle(GraphicContextOrchestrator $orchestrator): void
    {
        $match = TournamentMatch::find($this->matchId);
        if (! $match) {
            return;
        }

        // Only sync when a graphic session exists — avoids creating one for
        // matches where the broadcaster hasn't opened the controller yet.
        if (! $match->graphicSession) {
            return;
        }

        $orchestrator->syncAndBroadcast($match);
    }
}
