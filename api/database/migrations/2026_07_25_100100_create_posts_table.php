<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 16); // text | image | video | repost
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->string('background_id', 32)->nullable();
            $table->string('status', 32)->default('uploading');
            $table->string('visibility', 16)->default('public');
            $table->string('distribution', 32)->default('organic');
            $table->foreignId('repost_of_post_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->string('cover_path')->nullable();
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('comments_count')->default(0);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('saves_count')->default(0);
            $table->unsignedBigInteger('shares_count')->default(0);
            $table->unsignedBigInteger('reposts_count')->default(0);
            $table->unsignedInteger('reports_count')->default(0);
            $table->timestamp('published_at')->nullable();
            /** Profile pin; null = not pinned. */
            $table->timestamp('pinned_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'published_at']);
            $table->index(['status', 'published_at']);
            $table->index(['visibility', 'status', 'published_at']);
            $table->index(['type', 'published_at', 'id']);
            $table->index(['user_id', 'published_at', 'id']);
            $table->index(['user_id', 'pinned_at']);
            $table->index(['distribution', 'published_at']);
            $table->index('likes_count');
            $table->index('views_count');
            $table->index('repost_of_post_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
