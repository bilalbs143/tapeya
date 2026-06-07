<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('innings_bowling_stat_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('innings_id')
                ->constrained('innings')
                ->cascadeOnDelete();
            $table->foreignId('player_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedSmallInteger('legal_balls')->default(0);
            $table->unsignedSmallInteger('runs')->default(0);
            $table->unsignedSmallInteger('wickets')->default(0);
            $table->timestamps();

            $table->unique(['innings_id', 'player_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('innings_bowling_stat_overrides');
    }
};
