<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('player_match_bowling');
    }
};
