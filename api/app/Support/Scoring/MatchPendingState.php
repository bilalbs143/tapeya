<?php

namespace App\Support\Scoring;

use App\Models\TournamentMatch;

/**
 * Single source of truth for pre-ball / between-delivery pending hints.
 *
 * All slots live on {@see TournamentMatch::$pending_crease}:
 * - crease: next_batter_id, next_non_striker_id, next_bowler_id
 * - substitute overlay: substitute_replaced_id, substitute_player_id
 */
final class MatchPendingState
{
    /** @var list<string> */
    public const CREASE_KEYS = ['next_batter_id', 'next_non_striker_id', 'next_bowler_id'];

    /** @var list<string> */
    public const SUBSTITUTE_KEYS = ['substitute_replaced_id', 'substitute_player_id'];

    /** @var list<string> */
    public const ALL_KEYS = [
        'next_batter_id',
        'next_non_striker_id',
        'next_bowler_id',
        'substitute_replaced_id',
        'substitute_player_id',
    ];

    /**
     * Snapshot used by match-state, scorecard, and graphic context builders.
     *
     * @return array<string, mixed>
     */
    public static function resolve(TournamentMatch $match): array
    {
        return is_array($match->pending_crease) ? $match->pending_crease : [];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function merge(TournamentMatch $match, array $data): void
    {
        $patch = array_intersect_key($data, array_flip(self::ALL_KEYS));
        if ($patch === []) {
            return;
        }

        $existing = is_array($match->pending_crease) ? $match->pending_crease : [];
        $merged = $existing;

        foreach ($patch as $key => $value) {
            if ($value !== null) {
                $merged[$key] = $value;
            } else {
                unset($merged[$key]);
            }
        }

        $match->update(['pending_crease' => $merged === [] ? null : $merged]);
        $match->pending_crease = $merged === [] ? null : $merged;
    }

    public static function clearCreaseAfterBall(
        TournamentMatch $match,
        bool $isWicket = false,
        ?int $outPlayerId = null,
    ): void {
        $pending = is_array($match->pending_crease) ? $match->pending_crease : [];
        if ($pending === []) {
            return;
        }

        unset($pending['next_bowler_id']);

        if ($isWicket && $outPlayerId !== null && $outPlayerId > 0) {
            if (isset($pending['next_batter_id']) && (int) $pending['next_batter_id'] === $outPlayerId) {
                unset($pending['next_batter_id']);
            }
            if (isset($pending['next_non_striker_id']) && (int) $pending['next_non_striker_id'] === $outPlayerId) {
                unset($pending['next_non_striker_id']);
            }
        } elseif (! $isWicket) {
            unset($pending['next_batter_id'], $pending['next_non_striker_id']);
        }

        unset($pending['substitute_replaced_id'], $pending['substitute_player_id']);

        $match->update(['pending_crease' => $pending === [] ? null : $pending]);
        $match->pending_crease = $pending === [] ? null : $pending;
    }
}
