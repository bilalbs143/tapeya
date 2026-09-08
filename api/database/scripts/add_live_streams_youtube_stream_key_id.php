<?php

/**
 * One-off schema update for existing databases:
 *   Add live_streams.youtube_stream_key_id (+ FK to youtube_stream_keys)
 *
 * Fresh installs: create_youtube_stream_keys runs before create_live_streams,
 * which already defines the constrained column — no action needed.
 *
 * If you already ran 2026_09_07_001601_add_youtube_stream_key_id_to_live_streams_table
 * or 2026_09_07_001600_create_youtube_stream_keys_table, clean those rows from
 * `migrations` after the file renames; this script is a no-op when already applied.
 *
 * Run from api/:
 *   php artisan tinker
 *   >>> require database/scripts/add_live_streams_youtube_stream_key_id.php;
 *
 * Or non-interactive:
 *   php artisan tinker --execute="require 'database/scripts/add_live_streams_youtube_stream_key_id.php';"
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

if (! Schema::hasTable('live_streams')) {
    echo "live_streams table missing — nothing to do.\n";

    return;
}

if (! Schema::hasTable('youtube_stream_keys')) {
    echo "youtube_stream_keys table missing — run migrations first.\n";

    return;
}

if (! Schema::hasColumn('live_streams', 'youtube_stream_key_id')) {
    Schema::table('live_streams', function (Blueprint $table) {
        $table->foreignId('youtube_stream_key_id')
            ->nullable()
            ->after('provider_ingest_id')
            ->constrained('youtube_stream_keys')
            ->nullOnDelete();
    });
    echo "Added live_streams.youtube_stream_key_id + FK.\n";

    return;
}

echo "live_streams.youtube_stream_key_id already present.\n";

try {
    Schema::table('live_streams', function (Blueprint $table) {
        $table->foreign('youtube_stream_key_id')
            ->references('id')
            ->on('youtube_stream_keys')
            ->nullOnDelete();
    });
    echo "Added FK live_streams.youtube_stream_key_id → youtube_stream_keys.id.\n";
} catch (Throwable $e) {
    echo "FK live_streams.youtube_stream_key_id skipped (likely already present): {$e->getMessage()}\n";
}
