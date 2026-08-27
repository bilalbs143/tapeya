<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_bowling_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->string('tournament_type', 30);
            $table->string('cricket_format', 30);
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
            $table->unique(['player_id', 'tournament_type', 'cricket_format']);
            $table->index(['tournament_type', 'cricket_format']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_bowling_stats');
    }
};
