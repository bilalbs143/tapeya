<?php

/**
 * One-off: teams.sponsor + teams.icon_players as free-text strings; drop team_icon_players.
 *
 * Fresh installs: create_teams_table already has these columns — no action needed.
 *
 * Run from api/:
 *   php artisan tinker --execute="require 'database/scripts/teams_free_text_sponsor_icons.php';"
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

if (! Schema::hasTable('teams')) {
    echo "teams table missing — nothing to do.\n";

    return;
}

Schema::table('teams', function (Blueprint $table) {
    if (! Schema::hasColumn('teams', 'sponsor')) {
        $table->string('sponsor', 500)->nullable()->after('city');
        echo "Added teams.sponsor.\n";
    }
    if (! Schema::hasColumn('teams', 'icon_players')) {
        $table->string('icon_players', 500)->nullable()->after('sponsor');
        echo "Added teams.icon_players.\n";
    }
});

if (Schema::hasColumn('teams', 'sponsor')) {
    echo "teams.sponsor present.\n";
}
if (Schema::hasColumn('teams', 'icon_players')) {
    // Convert leftover JSON array values (if any) to comma-separated strings.
    $converted = 0;
    foreach (DB::table('teams')->whereNotNull('icon_players')->get(['id', 'icon_players']) as $row) {
        $raw = $row->icon_players;
        if (! is_string($raw) || $raw === '') {
            continue;
        }
        $decoded = json_decode($raw, true);
        if (! is_array($decoded)) {
            continue;
        }
        $joined = implode(', ', array_values(array_filter(array_map(
            static fn ($v) => trim((string) $v),
            $decoded
        ), static fn ($v) => $v !== '')));
        DB::table('teams')->where('id', $row->id)->update([
            'icon_players' => $joined !== '' ? $joined : null,
        ]);
        $converted++;
    }
    echo $converted > 0
        ? "Converted {$converted} teams.icon_players JSON value(s) to strings.\n"
        : "teams.icon_players present (no JSON conversion needed).\n";
}

if (Schema::hasTable('team_icon_players')) {
    Schema::drop('team_icon_players');
    echo "Dropped team_icon_players.\n";
} else {
    echo "team_icon_players already absent.\n";
}
