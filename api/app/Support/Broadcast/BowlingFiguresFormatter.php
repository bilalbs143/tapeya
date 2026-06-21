<?php

namespace App\Support\Broadcast;

/**
 * Broadcast overlay bowling figures — wickets-runs with hyphen (e.g. "2-28").
 *
 * Stats/career APIs may still use slash notation; graphic context uses this format.
 */
final class BowlingFiguresFormatter
{
    public static function format(int $wickets, int $runsConceded): string
    {
        return "{$wickets}-{$runsConceded}";
    }
}
