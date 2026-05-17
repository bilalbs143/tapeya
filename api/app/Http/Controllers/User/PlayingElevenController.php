<?php

namespace App\Http\Controllers\User;

use App\Events\Scoring\MatchStateUpdated;
use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StorePlayingElevenRequest;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Services\MatchStateService;
use Illuminate\Http\JsonResponse;
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
    public function store(StorePlayingElevenRequest $request, TournamentMatch $match, Team $team, MatchStateService $matchStateService): JsonResponse
    {
        $authUser = $request->user();

        if (! $authUser->canOperateTournamentInApp($match->tournament)) {
            return $this->forbidden('You cannot manage the playing eleven for this match.');
        }

        // Team must be part of this match (home or away).
        if (! in_array($team->id, [$match->home_team_id, $match->away_team_id], true)) {
            return $this->forbidden('Team does not belong to this match.');
        }

        $playerIds = $request->validated('player_ids');

        // Block changes once scoring has started — player IDs are referenced by
        // existing ball records; replacing them mid-match corrupts the scorecard.
        $hasBalls = DB::table('balls')
            ->join('innings', 'innings.id', '=', 'balls.innings_id')
            ->where('innings.match_id', $match->id)
            ->exists();

        if ($hasBalls) {
            return $this->conflict('Playing eleven cannot be changed after scoring has started.');
        }

        // Ensure all players are already in the match squad.
        $squadCount = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->whereIn('user_id', $playerIds)
            ->count();

        if ($squadCount !== count($playerIds)) {
            return $this->forbidden('All players in the playing eleven must be in the match squad.');
        }

        // Playing eleven: between 1 and players_per_side (allows smaller squads for demo/testing).
        $playersPerSide = (int) $match->players_per_side ?: 11;
        $count = count($playerIds);
        if ($count < 1) {
            return $this->forbidden('Playing eleven must have at least one player.');
        }
        if ($count > $playersPerSide) {
            return $this->forbidden("Playing eleven cannot exceed {$playersPerSide} players.");
        }

        // A player cannot appear in both teams' playing elevens for the same match.
        $oppositeTeamId = $team->id === $match->home_team_id
            ? $match->away_team_id
            : $match->home_team_id;

        $crossTeamConflict = DB::table('match_players')
            ->where('match_id', $match->id)
            ->where('team_id', $oppositeTeamId)
            ->whereIn('user_id', $playerIds)
            ->exists();

        if ($crossTeamConflict) {
            return $this->forbidden('One or more players are already in the opposing team\'s playing eleven.');
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
