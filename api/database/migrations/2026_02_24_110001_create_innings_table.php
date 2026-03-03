<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('innings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('match_id')
                ->constrained('matches')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('innings_number'); // 1 or 2

            $table->foreignId('batting_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->foreignId('bowling_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->string('status', 30)->default('not_started'); // not_started, in_progress, completed

            $table->timestamps();

            $table->unique(['match_id', 'innings_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('innings');
    }
};
