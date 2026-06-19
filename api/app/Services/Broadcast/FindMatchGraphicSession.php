<?php

namespace App\Services\Broadcast;

use App\Models\MatchGraphicSession;
use App\Models\TournamentMatch;

/**
 * Read-only lookup for an existing match graphic session.
 * Never creates or mutates rows.
 */
final class FindMatchGraphicSession
{
    public static function forMatch(TournamentMatch $match): ?MatchGraphicSession
    {
        $match->loadMissing('graphicSession');

        return $match->graphicSession;
    }
}
