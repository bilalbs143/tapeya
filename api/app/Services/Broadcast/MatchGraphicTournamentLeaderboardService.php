<?php

namespace App\Services\Broadcast;

use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Tournament-wide and match-scoped leaderboards for graphic overlays.
 */
final class MatchGraphicTournamentLeaderboardService
{
    private const TOP_N = 5;

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    public function buildForMatch(TournamentMatch $match): array
    {
        $empty = [
            'graphic_leaderboard_runs' => [],
            'graphic_leaderboard_fours' => [],
            'graphic_leaderboard_sixes' => [],
            'graphic_leaderboard_wickets' => [],
            'graphic_leaderboard_match_runs' => [],
            'graphic_leaderboard_match_wickets' => [],
        ];

        $avatarUrl = $this->mediaUrlResolver();
        $matchId = (int) $match->id;

        $matchRuns = PlayerMatchBatting::query()
            ->where('match_id', $matchId)
            ->orderByDesc('runs')
            ->limit(self::TOP_N)
            ->get(['player_id', 'runs', 'not_outs']);

        $matchWickets = PlayerMatchBowling::query()
            ->where('match_id', $matchId)
            ->orderByDesc('wickets')
            ->limit(self::TOP_N)
            ->get(['player_id', 'wickets']);

        $result = [
            'graphic_leaderboard_match_runs' => $this->mapMatchBattingRows($matchRuns, $matchId, $avatarUrl),
            'graphic_leaderboard_match_wickets' => $this->mapMatchBowlingRows($matchWickets, $matchId, $avatarUrl),
        ];

        $matchIds = $this->tournamentMatchIds($match);
        if ($matchIds === null) {
            return array_merge($empty, $result);
        }

        return array_merge($result, [
            'graphic_leaderboard_runs' => $this->mapRows(
                $this->aggregateBatting($matchIds, 'runs'),
                'runs',
                'runs',
                $matchIds,
                $avatarUrl,
            ),
            'graphic_leaderboard_fours' => $this->mapRows(
                $this->aggregateBatting($matchIds, 'fours'),
                'value',
                'fours',
                $matchIds,
                $avatarUrl,
            ),
            'graphic_leaderboard_sixes' => $this->mapRows(
                $this->aggregateBatting($matchIds, 'sixes'),
                'value',
                'sixes',
                $matchIds,
                $avatarUrl,
            ),
            'graphic_leaderboard_wickets' => $this->mapRows(
                $this->aggregateBowlingWickets($matchIds),
                'wickets',
                'wickets',
                $matchIds,
                $avatarUrl,
            ),
        ]);
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
     * @param  list<int>  $playerIds
     * @param  list<int>  $matchIds
     * @return array<int, string>
     */
    private function teamNamesForPlayers(array $playerIds, array $matchIds): array
    {
        if ($playerIds === [] || $matchIds === []) {
            return [];
        }

        return DB::table('match_players as mp')
            ->join('teams as t', 't.id', '=', 'mp.team_id')
            ->whereIn('mp.match_id', $matchIds)
            ->whereIn('mp.user_id', $playerIds)
            ->orderByDesc('mp.match_id')
            ->get(['mp.user_id', 't.name'])
            ->unique('user_id')
            ->mapWithKeys(fn ($row) => [(int) $row->user_id => (string) $row->name])
            ->all();
    }

    /**
     * @param  Collection<int, object{player_id: int|string, metric_total: int|string}>  $agg
     * @param  'runs'|'value'|'wickets'  $metricKey
     * @param  'runs'|'fours'|'sixes'|'wickets'  $metricKind
     * @param  list<int>  $matchIds
     * @return list<array<string, mixed>>
     */
    private function mapRows(
        Collection $agg,
        string $metricKey,
        string $metricKind,
        array $matchIds,
        \Closure $avatarUrl,
    ): array {
        $ids = $agg->pluck('player_id')->map(fn ($id) => (int) $id)->unique()->values()->all();
        if ($ids === []) {
            return [];
        }

        $users = User::query()->whereIn('id', $ids)->get()->keyBy('id');
        $teamNames = $this->teamNamesForPlayers($ids, $matchIds);
        $out = [];
        $rank = 1;
        foreach ($agg as $row) {
            $uid = (int) $row->player_id;
            $u = $users->get($uid);
            $out[] = [
                'rank' => str_pad((string) $rank, 2, '0', STR_PAD_LEFT),
                $metricKey => (int) $row->metric_total,
                'metric_kind' => $metricKind,
                'name' => $u?->name ?? '',
                'team' => $teamNames[$uid] ?? '',
                'team_name' => $teamNames[$uid] ?? '',
                'is_not_out' => false,
                'avatar_url' => $u?->avatar ? $avatarUrl($u->avatar) : null,
            ];
            $rank++;
        }

        return $out;
    }

    /**
     * @param  Collection<int, PlayerMatchBatting>  $rows
     * @return list<array<string, mixed>>
     */
    private function mapMatchBattingRows(Collection $rows, int $matchId, \Closure $avatarUrl): array
    {
        $ids = $rows->pluck('player_id')->map(fn ($id) => (int) $id)->all();
        if ($ids === []) {
            return [];
        }

        $users = User::query()->whereIn('id', $ids)->get()->keyBy('id');
        $teamNames = $this->teamNamesForPlayers($ids, [$matchId]);
        $out = [];
        $rank = 1;
        foreach ($rows as $row) {
            $uid = (int) $row->player_id;
            $u = $users->get($uid);
            $out[] = [
                'rank' => str_pad((string) $rank, 2, '0', STR_PAD_LEFT),
                'runs' => (int) $row->runs,
                'metric_kind' => 'runs',
                'name' => $u?->name ?? '',
                'team' => $teamNames[$uid] ?? '',
                'team_name' => $teamNames[$uid] ?? '',
                'is_not_out' => (int) ($row->not_outs ?? 0) > 0,
                'avatar_url' => $u?->avatar ? $avatarUrl($u->avatar) : null,
            ];
            $rank++;
        }

        return $out;
    }

    /**
     * @param  Collection<int, PlayerMatchBowling>  $rows
     * @return list<array<string, mixed>>
     */
    private function mapMatchBowlingRows(Collection $rows, int $matchId, \Closure $avatarUrl): array
    {
        $ids = $rows->pluck('player_id')->map(fn ($id) => (int) $id)->all();
        if ($ids === []) {
            return [];
        }

        $users = User::query()->whereIn('id', $ids)->get()->keyBy('id');
        $teamNames = $this->teamNamesForPlayers($ids, [$matchId]);
        $out = [];
        $rank = 1;
        foreach ($rows as $row) {
            $uid = (int) $row->player_id;
            $u = $users->get($uid);
            $out[] = [
                'rank' => str_pad((string) $rank, 2, '0', STR_PAD_LEFT),
                'wickets' => (int) $row->wickets,
                'metric_kind' => 'wickets',
                'name' => $u?->name ?? '',
                'team' => $teamNames[$uid] ?? '',
                'team_name' => $teamNames[$uid] ?? '',
                'is_not_out' => false,
                'avatar_url' => $u?->avatar ? $avatarUrl($u->avatar) : null,
            ];
            $rank++;
        }

        return $out;
    }
}
