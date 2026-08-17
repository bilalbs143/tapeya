<?php

namespace App\Http\Controllers\User;

use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StorePlayingElevenRequest;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Services\MatchParticipationService;
use App\Services\MatchStateService;
use App\Support\MatchSquadRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PlayingElevenController extends Controller
{
    use BaseControllerTrait;

    /**
     * Get the playing eleven (player ids) for a team in a match.
     */
    public function show(TournamentMatch $match, Team $team): JsonResponse
    {
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $rows = DB::table('match_players as mp')
            ->join('users as u', 'u.id', '=', 'mp.user_id')
            ->where('mp.match_id', $match->id)
            ->where('mp.team_id', $team->id)
            ->orderBy('mp.id')
            ->get(['mp.user_id', 'mp.playing_role', 'u.name', 'u.nickname']);

        $playerIds = $rows->pluck('user_id')->values()->all();

        $players = $rows->map(function ($r) {
            $role = $r->playing_role
                ? Str::headline(str_replace('_', ' ', $r->playing_role))
                : 'Player';

            return [
                'id' => (int) $r->user_id,
                'name' => $r->name ?: $r->nickname ?: 'Player',
                'role' => $role,
            ];
        })->values()->all();

        return $this->success([
            'match_id' => $match->id,
            'team_id' => $team->id,
            'player_ids' => $playerIds,
            'players' => $players,
        ]);
    }

    /**
     * Select playing eleven for a given team in a match (after toss, Step 6 in docs).
     *
     * Only organizers can manage playing elevens.
     * Players must already be in the match squad for this match + team.
     */
    public function store(
        StorePlayingElevenRequest $request,
        TournamentMatch $match,
        Team $team,
        MatchStateService $matchStateService,
        MatchParticipationService $participationService,
    ): JsonResponse {
        $authUser = $request->user();

        if (! $authUser->canOperateMatchInApp($match)) {
            return $this->forbidden('You cannot manage the playing eleven for this match.');
        }

        // Team must be part of this match (home or away).
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = $request->validated('player_ids');

        $hasBalls = $participationService->matchHasBalls($match);

        if ($hasBalls) {
            $participated = $participationService->participatedPlayerIds($match, (int) $team->id);
            $missing = array_diff($participated, $playerIds);
            if ($missing !== []) {
                return $this->conflict(
                    'Players who have already participated must remain in the playing eleven.',
                );
            }
        }

        if ($error = MatchSquadRules::playingElevenSubsetError($match, $team, $playerIds)) {
            return $this->forbidden($error);
        }

        $count = count($playerIds);

        if ($error = MatchSquadRules::playingElevenSizeError($match, $count)) {
            return $this->conflict($error);
        }

        if ($error = MatchSquadRules::bothSidesConflictError($match, $team, $playerIds)) {
            return $this->forbidden($error);
        }

        // Replace existing playing eleven atomically — delete + insert must both succeed or neither.
        $now = now();
        $rows = [];
        foreach ($playerIds as $userId) {
            $rows[] = [
                'match_id' => $match->id,
                'team_id' => $team->id,
                'user_id' => $userId,
                'playing_role' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::transaction(function () use ($match, $team, $rows) {
            DB::table('match_players')
                ->where('match_id', $match->id)
                ->where('team_id', $team->id)
                ->delete();

            if ($rows) {
                DB::table('match_players')->insert($rows);
            }
        });

        // Invalidate the playing-eleven cache so MatchStateService::build() re-reads the new XI.
        Cache::forget("match:{$match->id}:playing_eleven");

        // Broadcast the full match state so all subscribers (backoffice,
        // graphic controller, scorecard) learn about the updated squad before
        // the first ball is bowled.
        $matchState = $matchStateService->build($match->fresh());
        MatchStateUpdated::dispatch($match->id, $matchState);

        return $this->success(
            [
                'match_id' => $match->id,
                'team_id' => $team->id,
                'player_ids' => $playerIds,
            ],
            'Playing eleven updated.',
            'SUCCESS'
        );
    }
}
