<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_substitutes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')
                ->constrained('matches')
                ->cascadeOnDelete();
            $table->foreignId('innings_id')
                ->nullable()
                ->constrained('innings')
                ->nullOnDelete();
            // restrictOnDelete: prevents deleting a user who appears in historical substitution
            // records — preserves the audit trail. Use soft-delete on users instead of hard delete.
            $table->foreignId('replaced_player_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->foreignId('substitute_player_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->foreignId('fielder_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            // One substitution record per replaced player per match.
            // Prevents recording the same player as substituted twice in the same match.
            $table->unique(['match_id', 'replaced_player_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_substitutes');
    }
};
