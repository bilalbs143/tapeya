<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_batting_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->string('tournament_type', 30);
            $table->string('cricket_format', 30);
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
            $table->unique(['player_id', 'tournament_type', 'cricket_format']);
            $table->index(['tournament_type', 'cricket_format']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_batting_stats');
    }
};
