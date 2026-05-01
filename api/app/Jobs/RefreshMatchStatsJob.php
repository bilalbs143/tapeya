<?php

namespace App\Jobs;

use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\PlayerBattingStats;
use App\Models\PlayerBowlingStats;
use App\Models\PlayerFieldingStats;
use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\PlayerMatchFielding;
use App\Models\TournamentMatch;
use App\Services\PlayerStatsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class RefreshMatchStatsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $matchId
    ) {}

    public function handle(PlayerStatsService $service): void
    {
        $match = TournamentMatch::with('tournament')->find($this->matchId);
        if (! $match || ! $match->tournament) {
            return;
        }

        $eventType = $match->tournament->tournament_type;
        $eventTypeValue = $eventType instanceof TournamentTypeEnum ? $eventType->value : (string) $eventType;

        $batting = $service->computeBattingForMatch($this->matchId);
        $bowling = $service->computeBowlingForMatch($this->matchId);
        $fielding = $service->computeFieldingForMatch($this->matchId);

        $matchIdsInEvent = TournamentMatch::where('tournament_id', $match->tournament_id)
            ->pluck('id')
            ->all();

        DB::transaction(function () use ($batting, $bowling, $fielding, $eventTypeValue, $matchIdsInEvent) {
            // ── Wipe and re-insert per-match rows ──────────────────────────────
            PlayerMatchBatting::where('match_id', $this->matchId)->delete();
            PlayerMatchBowling::where('match_id', $this->matchId)->delete();
            PlayerMatchFielding::where('match_id', $this->matchId)->delete();

            foreach ($batting as $row) {
                PlayerMatchBatting::create([
                    'player_id' => $row['player_id'],
                    'match_id' => $this->matchId,
                    'matches' => 1,
                    'innings' => $row['innings'],
                    'not_outs' => $row['not_outs'],
                    'runs' => $row['runs'],
                    'balls_faced' => $row['balls_faced'],
                    'fours' => $row['fours'],
                    'sixes' => $row['sixes'],
                    'dots' => $row['dots'],
                    'highest_score' => $row['highest_score'],
                    'hundreds' => $row['hundreds'],
                    'fifties' => $row['fifties'],
                    'average' => $row['average'],
                    'strike_rate' => $row['strike_rate'],
                ]);
            }

            foreach ($bowling as $row) {
                PlayerMatchBowling::create([
                    'player_id' => $row['player_id'],
                    'match_id' => $this->matchId,
                    'matches' => 1,
                    'innings' => $row['innings'],
                    'overs' => $row['overs'],
                    'maidens' => $row['maidens'],
                    'runs_conceded' => $row['runs_conceded'],
                    'wickets' => $row['wickets'],
                    'no_balls' => $row['no_balls'],
                    'wides' => $row['wides'],
                    'best_bowling_innings' => $row['best_bowling_innings'],
                    'best_bowling_match' => $row['best_bowling_match'],
                    'five_wickets' => $row['five_wickets'],
                    'ten_wickets' => $row['ten_wickets'],
                    'average' => $row['average'],
                    'economy' => $row['economy'],
                    'strike_rate' => $row['strike_rate'],
                ]);
            }

            foreach ($fielding as $row) {
                PlayerMatchFielding::create([
                    'player_id' => $row['player_id'],
                    'match_id' => $this->matchId,
                    'matches' => 1,
                    'catches' => $row['catches'],
                    'run_outs' => $row['run_outs'],
                    'stumpings' => $row['stumpings'],
                ]);
            }

            // ── Refresh accumulative stats for every affected player ───────────
            $playerIds = collect($batting)->pluck('player_id')
                ->merge(collect($bowling)->pluck('player_id'))
                ->merge(collect($fielding)->pluck('player_id'))
                ->unique()
                ->values()
                ->all();

            foreach ($playerIds as $playerId) {
                $this->refreshAccumulativeBatting($playerId, $eventTypeValue, $matchIdsInEvent);
                $this->refreshAccumulativeBowling($playerId, $eventTypeValue, $matchIdsInEvent);
                $this->refreshAccumulativeFielding($playerId, $eventTypeValue, $matchIdsInEvent);
            }
        });
    }

    // ─── Private: accumulative refresh helpers ────────────────────────────────

    private function refreshAccumulativeBatting(int $playerId, string $eventType, array $matchIdsInEvent): void
    {
        $rows = PlayerMatchBatting::where('player_id', $playerId)
            ->whereIn('match_id', $matchIdsInEvent)
            ->get();

        if ($rows->isEmpty()) {
            PlayerBattingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventType)
                ->delete();

            return;
        }

        $matches = $rows->count();
        $innings = $rows->sum('innings');
        $notOuts = $rows->sum('not_outs');
        $runs = $rows->sum('runs');
        $ballsFaced = $rows->sum('balls_faced');
        $fours = $rows->sum('fours');
        $sixes = $rows->sum('sixes');
        $dots = $rows->sum('dots');
        $hundreds = $rows->sum('hundreds');
        $fifties = $rows->sum('fifties');

        // Pick the highest individual innings score across all match rows.
        // rtrim strips the not-out '*' before numeric comparison.
        $highestScore = $rows
            ->sortByDesc(fn ($row) => (int) rtrim($row->highest_score, '*'))
            ->first()
            ?->highest_score ?? '0';

        $average = PlayerStatsService::battingAverage($runs, $innings, $notOuts);
        $strikeRate = $ballsFaced > 0 ? round(100 * $runs / $ballsFaced, 2) : null;

        PlayerBattingStats::updateOrCreate(
            ['player_id' => $playerId, 'tournament_type' => $eventType],
            [
                'matches' => $matches,
                'innings' => $innings,
                'not_outs' => $notOuts,
                'runs' => $runs,
                'balls_faced' => $ballsFaced,
                'fours' => $fours,
                'sixes' => $sixes,
                'dots' => $dots,
                'highest_score' => $highestScore,
                'hundreds' => $hundreds,
                'fifties' => $fifties,
                'average' => $average,
                'strike_rate' => $strikeRate,
            ]
        );
    }

    private function refreshAccumulativeBowling(int $playerId, string $eventType, array $matchIdsInEvent): void
    {
        $rows = PlayerMatchBowling::where('player_id', $playerId)
            ->whereIn('match_id', $matchIdsInEvent)
            ->get();

        if ($rows->isEmpty()) {
            PlayerBowlingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventType)
                ->delete();

            return;
        }

        $matches = $rows->count();
        $innings = $rows->sum('innings');
        $runsConceded = $rows->sum('runs_conceded');
        $wickets = $rows->sum('wickets');
        $noBalls = $rows->sum('no_balls');
        $wides = $rows->sum('wides');
        $fiveWickets = $rows->sum('five_wickets');
        $tenWickets = $rows->sum('ten_wickets');
        $maidens = $rows->sum('maidens');

        // Summing floats directly corrupts the total (e.g. 2.3 + 2.4 = 4.7 but correct = 5.0).
        // Convert each row's overs to a real ball count, sum, then convert back.
        $totalBalls = $rows->sum(function ($row) {
            $wholeOvers = (int) $row->overs;
            $remainingBalls = (int) round(($row->overs - $wholeOvers) * 10);

            return $wholeOvers * 6 + $remainingBalls;
        });
        $overs = floor($totalBalls / 6) + round(($totalBalls % 6) / 10, 1);

        // overs × 6 would be wrong when overs is stored as decimal shorthand.
        $average = $wickets > 0 ? round($runsConceded / $wickets, 2) : null;
        $economy = $overs > 0 ? round($runsConceded / $overs, 2) : null;
        $strikeRate = ($wickets > 0 && $totalBalls > 0) ? round($totalBalls / $wickets, 2) : null;

        // Each PlayerMatchBowling row already stores them correctly — pick the best of each.
        $bestBowlingInnings = $this->pickBestBowlingFigure(
            $rows->pluck('best_bowling_innings')->all()
        );
        $bestBowlingMatch = $this->pickBestBowlingFigure(
            $rows->pluck('best_bowling_match')->all()
        );

        PlayerBowlingStats::updateOrCreate(
            ['player_id' => $playerId, 'tournament_type' => $eventType],
            [
                'matches' => $matches,
                'innings' => $innings,
                'overs' => $overs,
                'maidens' => $maidens,
                'runs_conceded' => $runsConceded,
                'wickets' => $wickets,
                'no_balls' => $noBalls,
                'wides' => $wides,
                'best_bowling_innings' => $bestBowlingInnings,
                'best_bowling_match' => $bestBowlingMatch,
                'five_wickets' => $fiveWickets,
                'ten_wickets' => $tenWickets,
                'average' => $average,
                'economy' => $economy,
                'strike_rate' => $strikeRate,
            ]
        );
    }

    private function refreshAccumulativeFielding(int $playerId, string $eventType, array $matchIdsInEvent): void
    {
        $rows = PlayerMatchFielding::where('player_id', $playerId)
            ->whereIn('match_id', $matchIdsInEvent)
            ->get();

        if ($rows->isEmpty()) {
            PlayerFieldingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventType)
                ->delete();

            return;
        }

        PlayerFieldingStats::updateOrCreate(
            ['player_id' => $playerId, 'tournament_type' => $eventType],
            [
                'matches' => $rows->count(),
                'catches' => $rows->sum('catches'),
                'run_outs' => $rows->sum('run_outs'),
                'stumpings' => $rows->sum('stumpings'),
            ]
        );
    }

    /**
     * Given an array of bowling figure strings like ["3/24", "2/18", "0/0"],
     * return the best one: most wickets first, fewest runs as tiebreaker.
     */
    private function pickBestBowlingFigure(array $figures): string
    {
        if (empty($figures)) {
            return '0/0';
        }

        $parsed = array_map(function (string $figure) {
            [$wickets, $runs] = explode('/', $figure.'/0');

            return ['wickets' => (int) $wickets, 'runs' => (int) $runs, 'raw' => $figure];
        }, $figures);

        usort($parsed, fn ($a, $b) => $b['wickets'] <=> $a['wickets'] ?: $a['runs'] <=> $b['runs']);

        return $parsed[0]['raw'];
    }
}
