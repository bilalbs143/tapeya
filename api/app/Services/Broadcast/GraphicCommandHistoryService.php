<?php

namespace App\Services\Broadcast;

use App\Models\MatchGraphicCommand;
use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Clears graphic-controller command rows for a session (used after match ends
 * and by the scheduled purge of stale commands).
 */
final class GraphicCommandHistoryService
{
    /**
     * Delete all commands for this session and clear the active pointer.
     * Used by the admin clear-history endpoint and post-match cleanup.
     */
    public function clearEntireSession(MatchGraphicSession $session, ?int $updatedByUserId = null): void
    {
        DB::transaction(function () use ($session, $updatedByUserId): void {
            $session->update([
                'active_command_id' => null,
                'updated_by' => $updatedByUserId,
            ]);

            MatchGraphicCommand::query()
                ->where('match_graphic_session_id', $session->id)
                ->delete();
        });
    }

    public function clearForMatchIfSessionExists(TournamentMatch $match): void
    {
        $session = $match->graphicSession;
        if (! $session) {
            return;
        }

        $this->clearEntireSession($session, null);
    }

    /**
     * Remove commands older than the cutoff. Sessions whose active command is
     * deleted get {@see MatchGraphicSession::$active_command_id} nulled first.
     *
     * @return int Number of deleted command rows
     */
    public function deleteCommandsCreatedBefore(Carbon $cutoff): int
    {
        return (int) DB::transaction(function () use ($cutoff): int {
            MatchGraphicSession::query()
                ->whereNotNull('active_command_id')
                ->whereIn(
                    'active_command_id',
                    MatchGraphicCommand::query()
                        ->select('id')
                        ->where('created_at', '<', $cutoff),
                )
                ->update(['active_command_id' => null]);

            return MatchGraphicCommand::query()
                ->where('created_at', '<', $cutoff)
                ->delete();
        });
    }
}
