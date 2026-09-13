<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('live_streams', 'youtube_stream_key_id')) {
            return;
        }

        Schema::table('live_streams', function (Blueprint $table) {
            $table->foreignId('youtube_stream_key_id')
                ->nullable()
                ->constrained('youtube_stream_keys')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('live_streams', 'youtube_stream_key_id')) {
            return;
        }

        Schema::table('live_streams', function (Blueprint $table) {
            $table->dropConstrainedForeignId('youtube_stream_key_id');
        });
    }
};
