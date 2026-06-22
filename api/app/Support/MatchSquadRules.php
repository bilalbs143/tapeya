<?php

namespace App\Support;

use App\Enums\Event\MatchStatusEnum;
use App\Models\TournamentMatch;

/**
 * Shared squad / playing-eleven size rules for match lifecycle endpoints.
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
        $minRequired = self::hasMatchStarted($match) ? $playersPerSide : 1;

        if ($count < $minRequired) {
            return self::hasMatchStarted($match)
                ? "Playing eleven must have exactly {$playersPerSide} players once the match has started."
                : 'Playing eleven must have at least one player.';
        }

        return null;
    }
}
