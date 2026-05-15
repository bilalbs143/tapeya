<?php

namespace App\Services\Broadcast;

use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * Top-N tournament aggregates for graphic overlays (runs, 4s, 6s, wickets).
 */
final class MatchGraphicTournamentLeaderboardService
{
    private const TOP_N = 5;

    /**
     * @return array{
     *   graphic_leaderboard_runs: list<array<string, mixed>>,
     *   graphic_leaderboard_fours: list<array<string, mixed>>,
     *   graphic_leaderboard_sixes: list<array<string, mixed>>,
     *   graphic_leaderboard_wickets: list<array<string, mixed>>
     * }
     */
    public function buildForMatch(TournamentMatch $match): array
    {
        $empty = [
            'graphic_leaderboard_runs' => [],
            'graphic_leaderboard_fours' => [],
            'graphic_leaderboard_sixes' => [],
            'graphic_leaderboard_wickets' => [],
        ];

        $matchIds = $this->tournamentMatchIds($match);
        if ($matchIds === null) {
            return $empty;
        }

        $avatarUrl = $this->mediaUrlResolver();

        return [
            'graphic_leaderboard_runs' => $this->mapRows(
                $this->aggregateBatting($matchIds, 'runs'),
                'runs',
                $avatarUrl,
            ),
            'graphic_leaderboard_fours' => $this->mapRows(
                $this->aggregateBatting($matchIds, 'fours'),
                'value',
                $avatarUrl,
            ),
            'graphic_leaderboard_sixes' => $this->mapRows(
                $this->aggregateBatting($matchIds, 'sixes'),
                'value',
                $avatarUrl,
            ),
            'graphic_leaderboard_wickets' => $this->mapRows(
                $this->aggregateBowlingWickets($matchIds),
                'wickets',
                $avatarUrl,
            ),
        ];
    }

    /** @return list<int>|null */
    private function tournamentMatchIds(TournamentMatch $match): ?array
    {
        $tid = (int) ($match->tournament_id ?? 0);
        if ($tid <= 0) {
            return null;
        }

        $matchIds = TournamentMatch::query()->where('tournament_id', $tid)->pluck('id')->all();

        return $matchIds === [] ? null : $matchIds;
    }

    /** @return \Closure(?string): ?string */
    private function mediaUrlResolver(): \Closure
    {
        $disk = Storage::disk(config('filesystems.media_disk', 'public'));

        return static fn (?string $path): ?string => $path ? $disk->url($path) : null;
    }

    /**
     * @param  list<int>  $matchIds
     * @return Collection<int, object{player_id: int|string, metric_total: int|string}>
     */
    private function aggregateBatting(array $matchIds, string $column): Collection
    {
        $column = match ($column) {
            'runs', 'fours', 'sixes' => $column,
            default => 'runs',
        };

        return PlayerMatchBatting::query()
            ->whereIn('match_id', $matchIds)
            ->groupBy('player_id')
            ->selectRaw('player_id, SUM('.$column.') AS metric_total')
            ->orderByDesc('metric_total')
            ->limit(self::TOP_N)
            ->get();
    }

    /**
     * @param  list<int>  $matchIds
     * @return Collection<int, object{player_id: int|string, metric_total: int|string}>
     */
    private function aggregateBowlingWickets(array $matchIds): Collection
    {
        return PlayerMatchBowling::query()
            ->whereIn('match_id', $matchIds)
            ->groupBy('player_id')
            ->selectRaw('player_id, SUM(wickets) AS metric_total')
            ->orderByDesc('metric_total')
            ->limit(self::TOP_N)
            ->get();
    }

    /**
     * @param  Collection<int, object{player_id: int|string, metric_total: int|string}>  $agg
     * @param  'runs'|'value'|'wickets'  $metricKey
     * @return list<array<string, mixed>>
     */
    private function mapRows(Collection $agg, string $metricKey, \Closure $avatarUrl): array
    {
        $ids = $agg->pluck('player_id')->map(fn ($id) => (int) $id)->unique()->values()->all();
        if ($ids === []) {
            return [];
        }

        $users = User::query()->whereIn('id', $ids)->get()->keyBy('id');
        $out = [];
        $rank = 1;
        foreach ($agg as $row) {
            $uid = (int) $row->player_id;
            $u = $users->get($uid);
            $out[] = [
                'rank' => str_pad((string) $rank, 2, '0', STR_PAD_LEFT),
                $metricKey => (int) $row->metric_total,
                'name' => $u?->name ?? '',
                'team' => '',
                'image_url' => $u?->avatar ? $avatarUrl($u->avatar) : null,
            ];
            $rank++;
        }

        return $out;
    }
}
