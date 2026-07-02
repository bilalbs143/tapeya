<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_graphic_sessions', function (Blueprint $table) {
            $table->text('signed_overlay_url')->nullable()->after('context');
            $table->timestamp('signed_overlay_expires_at')->nullable()->after('signed_overlay_url');
        });
    }

    public function down(): void
    {
        Schema::table('match_graphic_sessions', function (Blueprint $table) {
            $table->dropColumn(['signed_overlay_url', 'signed_overlay_expires_at']);
        });
    }
};
