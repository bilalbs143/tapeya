<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_graphic_sessions', function (Blueprint $table) {
            // Stores the next batsman/bowler selected in the scoring app before
            // they face/bowl their first ball, so the graphic overlay can show them
            // immediately instead of showing a blank slot.
            // Shape: { next_batter_id, next_non_striker_id, next_bowler_id } (all optional int|null)
            $table->json('pending_players')->nullable()->after('context');
        });
    }

    public function down(): void
    {
        Schema::table('match_graphic_sessions', function (Blueprint $table) {
            $table->dropColumn('pending_players');
        });
    }
};
