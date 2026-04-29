<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_scoring_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 48);
            $table->foreignId('ball_id')->nullable()->constrained('balls')->nullOnDelete();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['tournament_match_id', 'created_at'], 'match_scoring_audits_match_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_scoring_audits');
    }
};
