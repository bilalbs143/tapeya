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

            $table->unsignedTinyInteger('innings_number');

            $table->foreignId('batting_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->foreignId('bowling_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->string('status', 30)->default('not_started');
            $table->string('end_reason', 50)->nullable();
            $table->string('ended_by', 20)->nullable();
            $table->text('end_comments')->nullable();
            $table->boolean('points_awarded_each')->default(false);

            $table->timestamps();

            $table->unique(['match_id', 'innings_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('innings');
    }
};
