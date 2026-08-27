<?php

namespace App\Jobs;

use App\Models\TournamentMatch;
use App\Services\Stats\PlayerAccumulativeStatsRecomputer;
use App\Services\Stats\PlayerMatchStatsWriter;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RefreshMatchStatsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $matchId
    ) {}

    public function handle(
        PlayerMatchStatsWriter $writer,
        PlayerAccumulativeStatsRecomputer $recomputer,
    ): void {
        $match = TournamentMatch::with('tournament')->find($this->matchId);
        if (! $match) {
            return;
        }

        $playerIds = $writer->write($match);

        if ($match->isTournamentKind() && $match->tournament !== null) {
            $recomputer->recompute($match, $playerIds);
        } elseif ($match->isQuick()) {
            $recomputer->recomputeQuick($match, $playerIds);
        }
    }
}
