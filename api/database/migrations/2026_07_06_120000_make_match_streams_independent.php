<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_streams', function (Blueprint $table) {
            $table->dropUnique(['match_id']);
            $table->string('title')->nullable()->after('match_id');
            $table->text('description')->nullable()->after('title');
            $table->text('streaming_url')->nullable()->after('description');
        });

        DB::statement('ALTER TABLE match_streams ALTER COLUMN match_id DROP NOT NULL');
        DB::statement('CREATE UNIQUE INDEX match_streams_match_id_unique ON match_streams (match_id) WHERE match_id IS NOT NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS match_streams_match_id_unique');
        // Standalone rows can't satisfy NOT NULL — this rollback is destructive for them.
        DB::statement('DELETE FROM match_streams WHERE match_id IS NULL');
        DB::statement('ALTER TABLE match_streams ALTER COLUMN match_id SET NOT NULL');

        Schema::table('match_streams', function (Blueprint $table) {
            $table->unique('match_id');
            $table->dropColumn(['title', 'description', 'streaming_url']);
        });
    }
};
