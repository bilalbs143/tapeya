<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Per-match: one row per player per match (match totals). Full column names.
        Schema::create('player_match_batting', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->unsignedTinyInteger('matches')->default(1);
            $table->unsignedTinyInteger('innings')->default(1);
            $table->unsignedTinyInteger('not_outs')->default(0);
            $table->unsignedInteger('runs')->default(0);
            $table->unsignedInteger('balls_faced')->default(0);
            $table->unsignedSmallInteger('fours')->default(0);
            $table->unsignedSmallInteger('sixes')->default(0);
            $table->unsignedInteger('dots')->default(0);
            $table->string('highest_score', 10)->default('0');
            $table->unsignedTinyInteger('hundreds')->default(0);
            $table->unsignedTinyInteger('fifties')->default(0);
            $table->decimal('average', 8, 2)->nullable();
            $table->decimal('strike_rate', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['player_id', 'match_id']);
            $table->index('match_id');
        });

        Schema::create('player_match_bowling', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->unsignedTinyInteger('matches')->default(1);
            $table->unsignedTinyInteger('innings')->default(0);
            $table->decimal('overs', 8, 2)->default(0);
            $table->unsignedTinyInteger('maidens')->default(0);
            $table->unsignedInteger('runs_conceded')->default(0);
            $table->unsignedTinyInteger('wickets')->default(0);
            $table->unsignedSmallInteger('no_balls')->default(0);
            $table->unsignedSmallInteger('wides')->default(0);
            $table->string('best_bowling_innings', 20)->default('0/0');
            $table->string('best_bowling_match', 20)->default('0/0');
            $table->unsignedTinyInteger('five_wickets')->default(0);
            $table->unsignedTinyInteger('ten_wickets')->default(0);
            $table->decimal('average', 8, 2)->nullable();
            $table->decimal('economy', 8, 2)->nullable();
            $table->decimal('strike_rate', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['player_id', 'match_id']);
            $table->index('match_id');
        });

        Schema::create('player_match_fielding', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->unsignedTinyInteger('matches')->default(1);
            $table->unsignedTinyInteger('catches')->default(0);
            $table->unsignedTinyInteger('run_outs')->default(0);
            $table->unsignedTinyInteger('stumpings')->default(0);
            $table->timestamps();
            $table->unique(['player_id', 'match_id']);
            $table->index('match_id');
        });

        // Accumulative by tournament_type: one row per player per tournament_type. Full column names.
        Schema::create('player_batting_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->string('tournament_type', 30); // league, open_tournament, emerging
            $table->unsignedInteger('matches')->default(0);
            $table->unsignedInteger('innings')->default(0);
            $table->unsignedInteger('not_outs')->default(0);
            $table->unsignedInteger('runs')->default(0);
            $table->unsignedInteger('balls_faced')->default(0);
            $table->unsignedInteger('fours')->default(0);
            $table->unsignedInteger('sixes')->default(0);
            $table->unsignedInteger('dots')->default(0);
            $table->string('highest_score', 10)->default('0');
            $table->unsignedInteger('hundreds')->default(0);
            $table->unsignedInteger('fifties')->default(0);
            $table->decimal('average', 8, 2)->nullable();
            $table->decimal('strike_rate', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['player_id', 'tournament_type']);
            $table->index('tournament_type');
        });

        Schema::create('player_bowling_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->string('tournament_type', 30);
            $table->unsignedInteger('matches')->default(0);
            $table->unsignedInteger('innings')->default(0);
            $table->decimal('overs', 10, 2)->default(0);
            $table->unsignedInteger('maidens')->default(0);
            $table->unsignedInteger('runs_conceded')->default(0);
            $table->unsignedInteger('wickets')->default(0);
            $table->unsignedInteger('no_balls')->default(0);
            $table->unsignedInteger('wides')->default(0);
            $table->string('best_bowling_innings', 20)->default('0/0');
            $table->string('best_bowling_match', 20)->default('0/0');
            $table->unsignedInteger('five_wickets')->default(0);
            $table->unsignedInteger('ten_wickets')->default(0);
            $table->decimal('average', 8, 2)->nullable();
            $table->decimal('economy', 8, 2)->nullable();
            $table->decimal('strike_rate', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['player_id', 'tournament_type']);
            $table->index('tournament_type');
        });

        Schema::create('player_fielding_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->string('tournament_type', 30);
            $table->unsignedInteger('matches')->default(0);
            $table->unsignedInteger('catches')->default(0);
            $table->unsignedInteger('run_outs')->default(0);
            $table->unsignedInteger('stumpings')->default(0);
            $table->timestamps();
            $table->unique(['player_id', 'tournament_type']);
            $table->index('tournament_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_fielding_stats');
        Schema::dropIfExists('player_bowling_stats');
        Schema::dropIfExists('player_batting_stats');
        Schema::dropIfExists('player_match_fielding');
        Schema::dropIfExists('player_match_bowling');
        Schema::dropIfExists('player_match_batting');
    }
};
