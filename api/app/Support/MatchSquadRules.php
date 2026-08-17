<?php

namespace App\Support;

use App\Enums\Event\MatchStatusEnum;
use App\Models\Team;
use App\Models\TournamentMatch;
use Illuminate\Support\Facades\DB;

/**
 * Shared squad / playing-eleven size and membership rules for match lifecycle endpoints.
 * Kind branch lives here (tournament vs quick); controllers stay thin callers.
 */
final class MatchSquadRules
{
    public static function playersPerSide(TournamentMatch $match): int
    {
        return max(1, (int) ($match->players_per_side ?: 11));
    }

    public static function isLocked(TournamentMatch $match): bool
    {
        return in_array($match->status, [MatchStatusEnum::COMPLETED, MatchStatusEnum::CANCELLED], true);
    }

    public static function hasMatchStarted(TournamentMatch $match): bool
    {
        return in_array($match->status, [MatchStatusEnum::TOSS_DONE, MatchStatusEnum::IN_PROGRESS], true);
    }

    /** @return string|null User-facing error, or null when valid. */
    public static function matchSquadSizeError(TournamentMatch $match, int $count): ?string
    {
        if (self::isLocked($match)) {
            return 'Match squad cannot be changed for a completed or cancelled match.';
        }

        $playersPerSide = self::playersPerSide($match);

        if (self::hasMatchStarted($match) && $count < $playersPerSide) {
            return "Squad must have at least {$playersPerSide} players once the match has started.";
        }

        return null;
    }

    /** @return string|null User-facing error, or null when valid. */
    public static function playingElevenSizeError(TournamentMatch $match, int $count): ?string
    {
        if (self::isLocked($match)) {
            return 'Playing eleven cannot be changed for a completed or cancelled match.';
        }

        $playersPerSide = self::playersPerSide($match);

        if ($count > $playersPerSide) {
            return "Playing eleven cannot exceed {$playersPerSide} players.";
        }

        if (self::hasMatchStarted($match) && $count !== $playersPerSide) {
            return "Playing eleven must have exactly {$playersPerSide} players once the match has started.";
        }

        if ($count < 1) {
            return 'Playing eleven must have at least one player.';
        }

        return null;
    }

    /**
     * All player ids must already be on the team's roster (`team_user`).
     * Quick Match create upserts walk-ups onto `team_user` first, so the same rule applies.
     *
     * @param  list<int>  $playerIds
     */
    public static function rosterSubsetError(TournamentMatch $match, Team $team, array $playerIds): ?string
    {
        if ($playerIds === []) {
            return null;
        }

        $squadCount = $team->players()
            ->whereIn('users.id', $playerIds)
            ->count();

        if ($squadCount !== count($playerIds)) {
            return 'All players must belong to the team-level squad before being added to the match squad.';
        }

        return null;
    }

    /**
     * Playing XI must be a subset of the announced match squad.
     *
     * @param  list<int>  $playerIds
     */
    public static function playingElevenSubsetError(TournamentMatch $match, Team $team, array $playerIds): ?string
    {
        if ($playerIds === []) {
            return null;
        }

        $squadCount = DB::table('match_squads')
            ->where('match_id', $match->id)
            ->where('team_id', $team->id)
            ->whereIn('user_id', $playerIds)
            ->count();

        if ($squadCount !== count($playerIds)) {
            return 'All players in the playing eleven must be in the match squad.';
        }

        return null;
    }

    /**
     * A player cannot appear in both sides' playing elevens.
     *
     * @param  list<int>  $playerIds
     */
    public static function bothSidesConflictError(TournamentMatch $match, Team $team, array $playerIds): ?string
    {
        if ($playerIds === []) {
            return null;
        }

        $oppositeTeamId = (int) $team->id === (int) $match->home_team_id
            ? $match->away_team_id
            : $match->home_team_id;

        $crossTeamConflict = DB::table('match_players')
            ->where('match_id', $match->id)
            ->where('team_id', $oppositeTeamId)
            ->whereIn('user_id', $playerIds)
            ->exists();

        if ($crossTeamConflict) {
            return 'One or more players are already in the opposing team\'s playing eleven.';
        }

        return null;
    }
}
