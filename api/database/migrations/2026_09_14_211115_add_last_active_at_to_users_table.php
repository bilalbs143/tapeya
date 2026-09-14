<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_active_at')->nullable()->after('active_platform_updated_at');
            $table->index('last_active_at');
        });

        // Best-effort backfill from prior platform sync timestamps.
        DB::table('users')
            ->whereNull('last_active_at')
            ->whereNotNull('active_platform_updated_at')
            ->update([
                'last_active_at' => DB::raw('active_platform_updated_at'),
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['last_active_at']);
            $table->dropColumn('last_active_at');
        });
    }
};
