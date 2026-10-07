<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drama_episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drama_serial_id')->constrained('drama_serials')->cascadeOnDelete();
            $table->unsignedInteger('episode_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('video_source', 16)->default('youtube');
            $table->string('video')->nullable();
            $table->string('duration')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('comments_count')->default(0);
            $table->timestamps();

            $table->unique(['drama_serial_id', 'episode_number']);
            $table->index('is_active');
            $table->index('views_count');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drama_episodes');
    }
};
