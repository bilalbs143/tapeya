<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('innings_batting_stat_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('innings_id')
                ->constrained('innings')
                ->cascadeOnDelete();
            $table->foreignId('player_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedSmallInteger('runs')->default(0);
            $table->unsignedSmallInteger('balls')->default(0);
            $table->timestamps();

            $table->unique(['innings_id', 'player_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('innings_batting_stat_overrides');
    }
};
