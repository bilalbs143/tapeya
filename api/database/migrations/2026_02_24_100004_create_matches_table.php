<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tournament_id')
                ->constrained('tournaments')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('group_index')->nullable();

            $table->foreignId('home_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->foreignId('away_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->date('match_date');
            $table->time('match_time');
            $table->string('venue_name');
            $table->unsignedTinyInteger('players_per_side')->default(11);

            $table->string('status', 20)->default('scheduled');

            $table->foreignId('winning_team_id')
                ->nullable()
                ->constrained('teams')
                ->nullOnDelete();
            $table->string('chose_to_bat_or_bowl', 10)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
