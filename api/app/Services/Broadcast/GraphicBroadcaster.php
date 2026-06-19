<?php

namespace App\Services\Broadcast;

use App\Events\Broadcast\Graphics\MatchGraphicCommandActivated;
use App\Models\MatchGraphicSession;

/**
 * Re-broadcasts the active graphic command after context changes.
 *
 * Callers must persist fresh context ({@see GraphicContextOrchestrator::syncForMatch})
 * before broadcasting so `context_hash` on the wire matches the DB.
 */
final class GraphicBroadcaster
{
    public function broadcastActiveCommand(MatchGraphicSession $session): void
    {
        $session->loadMissing('activeCommand');
        if ($session->activeCommand) {
            MatchGraphicCommandActivated::dispatch($session, $session->activeCommand);
        }
    }
}
