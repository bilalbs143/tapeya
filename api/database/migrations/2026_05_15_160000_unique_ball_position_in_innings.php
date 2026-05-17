<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Replace the non-unique index on (innings_id, over, ball_in_over) with a
 * unique constraint so the DB enforces that no two deliveries can occupy the
 * same position in an innings.  The server always computes these values via
 * InningsStatsService::nextBallPosition — this constraint is a safety net
 * against concurrent writes or manual edits creating duplicate ball positions.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            $table->dropIndex(['innings_id', 'over', 'ball_in_over']);
            $table->unique(['innings_id', 'over', 'ball_in_over'], 'balls_innings_over_ball_unique');
        });
    }

    public function down(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            $table->dropUnique('balls_innings_over_ball_unique');
            $table->index(['innings_id', 'over', 'ball_in_over']);
        });
    }
};
