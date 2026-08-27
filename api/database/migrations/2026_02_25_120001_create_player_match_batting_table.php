<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_match_batting', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->unsignedTinyInteger('matches')->default(1);
            $table->unsignedTinyInteger('innings')->default(1);
            $table->unsignedTinyInteger('not_outs')->default(0);
            $table->unsignedInteger('runs')->default(0);
            $table->unsignedInteger('balls_faced')->default(0);
            $table->unsignedSmallInteger('fours')->default(0);
            $table->unsignedSmallInteger('sixes')->default(0);
            $table->unsignedInteger('dots')->default(0);
            $table->string('highest_score', 10)->default('0');
            $table->unsignedTinyInteger('hundreds')->default(0);
            $table->unsignedTinyInteger('fifties')->default(0);
            $table->decimal('average', 8, 2)->nullable();
            $table->decimal('strike_rate', 8, 2)->nullable();
            $table->timestamps();
            $table->unique(['player_id', 'match_id']);
            $table->index('match_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_match_batting');
    }
};
