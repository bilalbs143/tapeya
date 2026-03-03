<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')
                ->constrained('matches')
                ->cascadeOnDelete();
            $table->foreignId('team_id')
                ->constrained('teams')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('playing_role', 30)->nullable();
            $table->timestamps();

            $table->unique(['match_id', 'team_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_players');
    }
};
