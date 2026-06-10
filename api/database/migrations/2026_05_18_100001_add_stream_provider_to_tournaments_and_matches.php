<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->string('stream_provider', 30)->nullable()->after('status');
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->string('stream_provider_override', 30)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn('stream_provider');
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn('stream_provider_override');
        });
    }
};
