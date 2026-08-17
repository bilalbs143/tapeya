<?php

namespace App\Services\Stats;

use App\Enums\Event\CricketFormatEnum;
use App\Enums\Event\MatchKindEnum;
use App\Enums\Stats\StatsBucketEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Models\PlayerBattingStats;
use App\Models\PlayerBowlingStats;
use App\Models\PlayerFieldingStats;
use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\PlayerMatchFielding;
use App\Models\TournamentMatch;
use App\Services\PlayerStatsService;

/**
 * Refresh career buckets in player_*_stats.
 * Tournament path: league / OT / emerging (+ rankings cache bust).
 * Quick path: tournament_type='quick' keyed by match cricket_format (no rankings bust).
 */
final class PlayerAccumulativeStatsRecomputer
{
    /**
     * @param  list<int>  $playerIds
     */
    public function recompute(TournamentMatch $match, array $playerIds): void
    {
        if ($match->isQuick()) {
            return;
        }

        $match->loadMissing('tournament');
        $tournament = $match->tournament;
        if ($tournament === null) {
            return;
        }

        $eventType = $tournament->tournament_type;
        $eventTypeValue = $eventType instanceof TournamentTypeEnum ? $eventType->value : (string) $eventType;
        $cricketFormat = $tournament->cricket_format;
        $cricketFormatValue = $cricketFormat instanceof CricketFormatEnum
            ? $cricketFormat->value
            : (string) $cricketFormat;

        $matchIdsInBucket = TournamentMatch::query()
            ->whereHas('tournament', fn ($q) => $q
                ->where('tournament_type', $eventTypeValue)
                ->where('cricket_format', $cricketFormatValue))
            ->pluck('id')
            ->all();

        foreach ($playerIds as $playerId) {
            $this->refreshAccumulativeBatting((int) $playerId, $eventTypeValue, $cricketFormatValue, $matchIdsInBucket);
            $this->refreshAccumulativeBowling((int) $playerId, $eventTypeValue, $cricketFormatValue, $matchIdsInBucket);
            $this->refreshAccumulativeFielding((int) $playerId, $eventTypeValue, $cricketFormatValue, $matchIdsInBucket);
        }

        PlayerStatsService::bustRankingsCache();
    }

    /**
     * Refresh the casual/quick career bucket for players in this quick match.
     * Does not touch rankings cache.
     *
     * @param  list<int>  $playerIds
     */
    public function recomputeQuick(TournamentMatch $match, array $playerIds): void
    {
        if (! $match->isQuick()) {
            return;
        }

        $cricketFormat = $match->cricket_format;
        $cricketFormatValue = $cricketFormat instanceof CricketFormatEnum
            ? $cricketFormat->value
            : (string) $cricketFormat;

        if ($cricketFormatValue === '') {
            return;
        }

        $bucket = StatsBucketEnum::QUICK->value;

        $matchIdsInBucket = TournamentMatch::query()
            ->where('kind', MatchKindEnum::QUICK)
            ->where('cricket_format', $cricketFormatValue)
            ->pluck('id')
            ->all();

        foreach ($playerIds as $playerId) {
            $this->refreshAccumulativeBatting((int) $playerId, $bucket, $cricketFormatValue, $matchIdsInBucket);
            $this->refreshAccumulativeBowling((int) $playerId, $bucket, $cricketFormatValue, $matchIdsInBucket);
            $this->refreshAccumulativeFielding((int) $playerId, $bucket, $cricketFormatValue, $matchIdsInBucket);
        }
    }

    /**
     * @param  list<int|string>  $matchIdsInBucket
     */
    private function refreshAccumulativeBatting(int $playerId, string $eventType, string $cricketFormat, array $matchIdsInBucket): void
    {
        $rows = PlayerMatchBatting::where('player_id', $playerId)
            ->whereIn('match_id', $matchIdsInBucket)
            ->get();

        if ($rows->isEmpty()) {
            PlayerBattingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventType)
                ->where('cricket_format', $cricketFormat)
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

        $highestScore = $rows
            ->sortByDesc(fn ($row) => (int) rtrim($row->highest_score, '*'))
            ->first()
            ?->highest_score ?? '0';

        $average = PlayerStatsService::battingAverage($runs, $innings, $notOuts);
        $strikeRate = $ballsFaced > 0 ? round(100 * $runs / $ballsFaced, 2) : null;

        PlayerBattingStats::updateOrCreate(
            ['player_id' => $playerId, 'tournament_type' => $eventType, 'cricket_format' => $cricketFormat],
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

    /**
     * @param  list<int|string>  $matchIdsInBucket
     */
    private function refreshAccumulativeBowling(int $playerId, string $eventType, string $cricketFormat, array $matchIdsInBucket): void
    {
        $rows = PlayerMatchBowling::where('player_id', $playerId)
            ->whereIn('match_id', $matchIdsInBucket)
            ->get();

        if ($rows->isEmpty()) {
            PlayerBowlingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventType)
                ->where('cricket_format', $cricketFormat)
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

        $totalBalls = $rows->sum(fn ($row) => PlayerStatsService::legalBallsFromCricketOvers((float) $row->overs));
        $overs = PlayerStatsService::oversFromLegalBalls($totalBalls);

        $average = $wickets > 0 ? round($runsConceded / $wickets, 2) : null;
        $economy = PlayerStatsService::bowlingEconomy($runsConceded, $totalBalls);
        $strikeRate = PlayerStatsService::bowlingStrikeRate($totalBalls, $wickets);

        $bestBowlingInnings = $this->pickBestBowlingFigure(
            $rows->pluck('best_bowling_innings')->all()
        );
        $bestBowlingMatch = $this->pickBestBowlingFigure(
            $rows->pluck('best_bowling_match')->all()
        );

        PlayerBowlingStats::updateOrCreate(
            ['player_id' => $playerId, 'tournament_type' => $eventType, 'cricket_format' => $cricketFormat],
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

    /**
     * @param  list<int|string>  $matchIdsInBucket
     */
    private function refreshAccumulativeFielding(int $playerId, string $eventType, string $cricketFormat, array $matchIdsInBucket): void
    {
        $rows = PlayerMatchFielding::where('player_id', $playerId)
            ->whereIn('match_id', $matchIdsInBucket)
            ->get();

        if ($rows->isEmpty()) {
            PlayerFieldingStats::where('player_id', $playerId)
                ->where('tournament_type', $eventType)
                ->where('cricket_format', $cricketFormat)
                ->delete();

            return;
        }

        PlayerFieldingStats::updateOrCreate(
            ['player_id' => $playerId, 'tournament_type' => $eventType, 'cricket_format' => $cricketFormat],
            [
                'matches' => $rows->count(),
                'catches' => $rows->sum('catches'),
                'run_outs' => $rows->sum('run_outs'),
                'stumpings' => $rows->sum('stumpings'),
            ]
        );
    }

    /**
     * @param  list<string|null>  $figures
     */
    private function pickBestBowlingFigure(array $figures): string
    {
        $figures = array_values(array_filter($figures, fn ($figure) => is_string($figure) && $figure !== ''));

        if ($figures === []) {
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
