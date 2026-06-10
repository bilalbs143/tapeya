<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('highlight_user_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('highlight_id')->constrained('highlights')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reaction');   // 'like' | 'dislike'  (reuses ReactionEnum values)
            $table->timestamps();

            $table->unique(['highlight_id', 'user_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('highlight_user_reactions');
    }
};
