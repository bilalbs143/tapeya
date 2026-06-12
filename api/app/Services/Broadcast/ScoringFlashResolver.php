<?php

namespace App\Services\Broadcast;

use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Models\Ball;
use App\Services\InningsStatsService;

/**
 * Derives the ordered LT-flash command queue from a persisted Ball.
 *
 * Rules (v1 — LT only, no FST, no fifty/hundred):
 *   retired hurt      → []                   (not a dismissal; stored is_wicket=true)
 *   wide              → [LT_WIDE]
 *   wide + wicket     → [LT_WIDE, LT_OUT]
 *   no-ball           → [LT_NO_BALL]
 *   no-ball + 4 bat   → [LT_NO_BALL, LT_FOUR]
 *   no-ball + 6 bat   → [LT_NO_BALL, LT_SIX]
 *   no-ball + wicket  → [LT_NO_BALL, LT_OUT]
 *   wicket            → [LT_OUT]
 *   4 off bat         → [LT_FOUR]
 *   6 off bat         → [LT_SIX]
 *   dot / 1-3 / bye   → []
 *
 * Wide runs off bat is always 0 (InningsStatsService::strikerRunsOffBat returns 0
 * for wide), so LT_FOUR / LT_SIX are never appended on a wide delivery.
 *
 * Wicket on a boundary (e.g. run-out on a four): LT_OUT only — no LT_FOUR.
 *
 * Retired hurt is stored with is_wicket=true but must NOT show LT_OUT.
 */
final class ScoringFlashResolver
{
    /**
     * @return GraphicCommandKeyEnum[]
     */
    public static function resolve(Ball $ball): array
    {
        // Retired hurt: is_wicket is true in the DB but it is not a dismissal.
        if ($ball->is_wicket && $ball->isRetiredHurt()) {
            return [];
        }

        $queue = [];

        // ── Wide ─────────────────────────────────────────────────────────────
        if ($ball->is_wide) {
            $queue[] = GraphicCommandKeyEnum::LT_WIDE;

            if ($ball->is_wicket) {
                $queue[] = GraphicCommandKeyEnum::LT_OUT;
            }

            return $queue;
        }

        // ── No-ball prefix ───────────────────────────────────────────────────
        if ($ball->is_no_ball) {
            $queue[] = GraphicCommandKeyEnum::LT_NO_BALL;
        }

        // ── Wicket — appended after extra prefix; skip boundary check ────────
        if ($ball->is_wicket) {
            $queue[] = GraphicCommandKeyEnum::LT_OUT;

            return $queue;
        }

        // ── Boundary off bat ─────────────────────────────────────────────────
        $runsOffBat = InningsStatsService::strikerRunsOffBat($ball);

        if ($runsOffBat === 6) {
            $queue[] = GraphicCommandKeyEnum::LT_SIX;
        } elseif ($runsOffBat === 4) {
            $queue[] = GraphicCommandKeyEnum::LT_FOUR;
        }

        return $queue;
    }
}
