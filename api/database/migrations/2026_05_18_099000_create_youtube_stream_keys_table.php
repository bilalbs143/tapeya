<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('youtube_stream_keys', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            // YouTube liveStream resource id (long-lived ingest).
            $table->string('youtube_stream_id')->unique();
            $table->text('ingest_rtmp_url');
            $table->text('stream_key_encrypted');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('youtube_stream_keys');
    }
};
