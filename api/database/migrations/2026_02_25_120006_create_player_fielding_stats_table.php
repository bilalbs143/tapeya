<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_fielding_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->string('tournament_type', 30);
            $table->string('cricket_format', 30);
            $table->unsignedInteger('matches')->default(0);
            $table->unsignedInteger('catches')->default(0);
            $table->unsignedInteger('run_outs')->default(0);
            $table->unsignedInteger('stumpings')->default(0);
            $table->timestamps();
            $table->unique(['player_id', 'tournament_type', 'cricket_format']);
            $table->index(['tournament_type', 'cricket_format']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_fielding_stats');
    }
};
