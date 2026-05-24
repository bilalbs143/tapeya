<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_streams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->unique()->constrained('matches')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');

            $table->string('provider', 30);
            $table->string('status', 20)->default('idle');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();

            $table->string('provider_stream_id')->nullable();
            $table->string('provider_ingest_id')->nullable();
            $table->string('provider_playback_id')->nullable();
            $table->string('provider_recording_id')->nullable();

            $table->text('ingest_rtmp_url')->nullable();
            $table->text('stream_key_encrypted')->nullable();

            $table->text('playback_url')->nullable();
            $table->text('embed_url')->nullable();

            $table->jsonb('provider_metadata')->default('{}');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_streams');
    }
};
