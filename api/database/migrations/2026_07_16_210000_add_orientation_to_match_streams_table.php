<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_streams', function (Blueprint $table) {
            // Self-serve Go Live aspect — StreamOrientationEnum (portrait 9:16 default | landscape 16:9).
            // See docs/LIVE_STREAM_ORIENTATION.md. Non-self-serve rows keep the default;
            // viewer layout for those streams is driven by is_self_serve, not this column.
            $table->string('orientation', 16)->default('portrait')->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('match_streams', function (Blueprint $table) {
            $table->dropColumn('orientation');
        });
    }
};
