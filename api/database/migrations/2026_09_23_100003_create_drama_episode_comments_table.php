<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drama_episode_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drama_episode_id')->constrained('drama_episodes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('drama_episode_comments')->cascadeOnDelete();
            $table->text('body');
            $table->unsignedInteger('likes_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['drama_episode_id', 'parent_id', 'created_at'], 'drama_ep_comments_ep_parent_created_idx');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drama_episode_comments');
    }
};
