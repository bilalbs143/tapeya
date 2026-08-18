<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_match_fielding', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->unsignedTinyInteger('matches')->default(1);
            $table->unsignedTinyInteger('catches')->default(0);
            $table->unsignedTinyInteger('run_outs')->default(0);
            $table->unsignedTinyInteger('stumpings')->default(0);
            $table->timestamps();
            $table->unique(['player_id', 'match_id']);
            $table->index('match_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_match_fielding');
    }
};
