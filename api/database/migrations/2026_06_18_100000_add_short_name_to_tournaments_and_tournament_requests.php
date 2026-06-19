<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tournaments', 'short_name')) {
            Schema::table('tournaments', function (Blueprint $table) {
                $table->string('short_name', 64)->nullable()->after('tournament_name');
            });
        }

        if (! Schema::hasColumn('tournament_requests', 'short_name')) {
            Schema::table('tournament_requests', function (Blueprint $table) {
                $table->string('short_name', 64)->nullable()->after('tournament_name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tournaments', 'short_name')) {
            Schema::table('tournaments', function (Blueprint $table) {
                $table->dropColumn('short_name');
            });
        }

        if (Schema::hasColumn('tournament_requests', 'short_name')) {
            Schema::table('tournament_requests', function (Blueprint $table) {
                $table->dropColumn('short_name');
            });
        }
    }
};
