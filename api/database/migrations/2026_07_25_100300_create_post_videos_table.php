<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->unique()->constrained('posts')->cascadeOnDelete();
            $table->string('original_path')->nullable();
            $table->string('processed_path')->nullable();
            $table->string('hls_master_path')->nullable();
            $table->json('playback_variants')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('preview_path')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->text('processing_error')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->boolean('abr_complete')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_videos');
    }
};
