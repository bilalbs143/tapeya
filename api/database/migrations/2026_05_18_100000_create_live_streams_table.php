<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_streams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->nullable()->constrained('matches')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('orientation', 16)->default('portrait');
            $table->text('streaming_url')->nullable();
            $table->string('stream_thumbnail')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('owner_user_id')->nullable()->constrained('users')->nullOnDelete();

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

        DB::statement('CREATE UNIQUE INDEX live_streams_match_id_unique ON live_streams (match_id) WHERE match_id IS NOT NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS live_streams_match_id_unique');
        Schema::dropIfExists('live_streams');
    }
};
