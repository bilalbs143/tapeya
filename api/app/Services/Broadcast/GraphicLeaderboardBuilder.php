<?php

namespace App\Services\Broadcast;

use App\Models\TournamentMatch;

/**
 * Tournament leaderboard slices for the graphic overlay `context` blob.
 */
final class GraphicLeaderboardBuilder
{
    public function __construct(
        private readonly MatchGraphicTournamentLeaderboardService $tournamentLeaderboards,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function leaderboardFragment(TournamentMatch $match): array
    {
        return $this->tournamentLeaderboards->buildForMatch($match);
    }
}
