<?php

/**
 * One-off script for existing databases after tournament simplification.
 *
 * Fresh installs: create_tournaments_table already matches — no action needed.
 *
 * Run from api/:
 *   php artisan tinker
 *   >>> require database/scripts/simplify_tournaments.php;
 *
 * Or non-interactive:
 *   php artisan tinker --execute="require 'database/scripts/simplify_tournaments.php';"
 */

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

if (Schema::hasTable('tournament_requests')) {
    Schema::drop('tournament_requests');
    echo "Dropped tournament_requests table.\n";
} else {
    echo "tournament_requests already absent.\n";
}

if (Schema::hasColumn('tournaments', 'cricket_format')) {
    Schema::table('tournaments', function ($table) {
        $table->dropColumn('cricket_format');
    });
    echo "Dropped tournaments.cricket_format.\n";
} else {
    echo "tournaments.cricket_format already absent.\n";
}

if (Schema::hasColumn('tournaments', 'match_timings')) {
    Schema::table('tournaments', function ($table) {
        $table->dropColumn('match_timings');
    });
    echo "Dropped tournaments.match_timings.\n";
} else {
    echo "tournaments.match_timings already absent.\n";
}

$league = DB::table('tournaments')->where('tournament_type', 'league')->update(['tournament_type' => 'private_tournament']);
$emerging = DB::table('tournaments')->where('tournament_type', 'emerging')->update(['tournament_type' => 'open_tournament']);

foreach (['player_batting_stats', 'player_bowling_stats', 'player_fielding_stats'] as $table) {
    if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'tournament_type')) {
        continue;
    }
    DB::table($table)->where('tournament_type', 'league')->update(['tournament_type' => 'private_tournament']);
    DB::table($table)->where('tournament_type', 'emerging')->update(['tournament_type' => 'open_tournament']);

    if (Schema::hasColumn($table, 'cricket_format')) {
        // Postgres unique (player_id, tournament_type, cricket_format): skip rows that would
        // collide with an existing tape_ball row for the same player + tournament_type.
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'pgsql') {
            DB::statement("
                UPDATE {$table} AS t
                SET cricket_format = 'tape_ball'
                WHERE t.tournament_type <> 'quick'
                  AND t.cricket_format IS DISTINCT FROM 'tape_ball'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM {$table} AS existing
                      WHERE existing.player_id = t.player_id
                        AND existing.tournament_type = t.tournament_type
                        AND existing.cricket_format = 'tape_ball'
                  )
            ");
            // Drop leftover non-tape_ball rows that could not be normalized (duplicate keys).
            $deleted = DB::table($table)
                ->where('tournament_type', '!=', 'quick')
                ->where(function ($q) {
                    $q->whereNull('cricket_format')->orWhere('cricket_format', '!=', 'tape_ball');
                })
                ->delete();
            if ($deleted > 0) {
                echo "Removed {$deleted} conflicting {$table} rows that could not normalize to tape_ball.\n";
            }
        } else {
            DB::table($table)
                ->where('tournament_type', '!=', 'quick')
                ->update(['cricket_format' => 'tape_ball']);
        }
    }
}

echo "Migrated legacy tournament_type values (tournaments league→{$league}, emerging→{$emerging}).\n";
echo "Normalized tournament player_*_stats cricket_format to tape_ball.\n";
