<?php

namespace App\Http\Controllers\User;

use App\Enums\Stats\StatCategoryEnum;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Models\PlayerMatchBatting;
use App\Models\PlayerMatchBowling;
use App\Models\PlayerMatchFielding;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\PlayerStatsService;
use App\Support\Stats\StatBucketFilters;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PlayerStatsController extends Controller
{
    use BaseControllerTrait;

    /**
     * Accumulative stats for a player (profile), optionally by tournament_type and cricket_format.
     *
     * Query: tournament_type = league | open_tournament | emerging | quick | all (default: all)
     *        cricket_format = hard_ball | tape_ball | tennis_ball | hard_tennis | all (default: all)
     *
     * `all` = tournament career only (excludes quick). Use tournament_type=quick for casual career.
     */
    public function show(User $user): JsonResponse
    {
        try {
            $bucket = StatBucketFilters::fromProfileQuery(
                request()->query('tournament_type', 'all'),
                request()->query('cricket_format', 'all'),
            );
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage());
        }

        $service = app(PlayerStatsService::class);

        $data = [
            'player_id' => $user->id,
            'tournament_type' => $bucket['tournamentTypeQuery'],
            'cricket_format' => $bucket['cricketFormatQuery'],
            'batting' => $service->battingForPlayer($user->id, $bucket['statsBucket'], $bucket['cricketFormat']),
            'bowling' => $service->bowlingForPlayer($user->id, $bucket['statsBucket'], $bucket['cricketFormat']),
            'fielding' => $service->fieldingForPlayer($user->id, $bucket['statsBucket'], $bucket['cricketFormat']),
        ];

        return $this->success($data);
    }

    /**
     * Where this player sits on a leaderboard (same rules as GET /rankings).
     *
     * Query: tournament_type, cricket_format, category, sort, min_innings (qualification threshold)
     */
    public function rankingPosition(User $user): JsonResponse
    {
        $tournamentType = request()->query('tournament_type', 'open_tournament');
        $cricketFormat = request()->query('cricket_format', 'all');
        $minQualifyingCount = (int) request()->query('min_innings', 0);

        try {
            $bucket = StatBucketFilters::fromRankingsQuery($tournamentType, $cricketFormat);
            $categoryEnum = StatBucketFilters::parseCategoryOptional(
                request()->query('category'),
                StatCategoryEnum::defaultForPlayingRole($user->playing_role),
            );
        } catch (InvalidArgumentException $e) {
            return $this->failure($e->getMessage());
        }

        $sort = request()->query('sort') ?: $categoryEnum->defaultSort();

        $rank = app(PlayerStatsService::class)->rankPositionForPlayer(
            (int) $user->id,
            $tournamentType,
            $categoryEnum->value,
            $sort,
            $minQualifyingCount,
            $cricketFormat
        );

        return $this->success([
            'rank' => $rank,
            'tournament_type' => $tournamentType,
            'cricket_format' => $cricketFormat,
            'category' => $categoryEnum->value,
            'sort' => $sort,
        ]);
    }

    /**
     * Recent matches this player appeared in.
     * Presence = batting / bowling / fielding stats rows or match squad membership
     * (so bowling-only / fielding-only appearances are included).
     */
    public function recentMatches(User $user): JsonResponse
    {
        $limit = min(20, max(1, (int) request()->query('limit', 10)));
        $playerId = (int) $user->id;

        $matchIds = collect()
            ->merge(PlayerMatchBatting::query()->where('player_id', $playerId)->pluck('match_id'))
            ->merge(PlayerMatchBowling::query()->where('player_id', $playerId)->pluck('match_id'))
            ->merge(PlayerMatchFielding::query()->where('player_id', $playerId)->pluck('match_id'))
            ->merge(DB::table('match_squads')->where('user_id', $playerId)->pluck('match_id'))
            ->unique()
            ->filter()
            ->values()
            ->all();

        if ($matchIds === []) {
            return $this->success([]);
        }

        $matches = TournamentMatch::query()
            ->whereIn('id', $matchIds)
            ->with(['homeTeam', 'awayTeam'])
            ->orderByDesc('match_date')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();

        $battingByMatch = PlayerMatchBatting::query()
            ->where('player_id', $playerId)
            ->whereIn('match_id', $matches->pluck('id'))
            ->get()
            ->keyBy(fn ($row) => (int) $row->match_id);

        $data = $matches->map(function ($match) use ($battingByMatch) {
            $batting = $battingByMatch->get((int) $match->id);

            return [
                'match_id' => (int) $match->id,
                'kind' => $match->kind?->value,
                'status' => $match->status?->value,
                'match_date' => $match->match_date?->format('Y-m-d'),
                'home_team' => $match->homeTeam?->name,
                'away_team' => $match->awayTeam?->name,
                'tournament_id' => $match->tournament_id !== null ? (int) $match->tournament_id : null,
                'runs' => (int) ($batting?->runs ?? 0),
                'balls' => (int) ($batting?->balls_faced ?? 0),
            ];
        })->values();

        return $this->success($data);
    }
}
