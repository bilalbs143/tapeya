<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('active_platform', 20)->nullable()->after('status');
            $table->timestamp('active_platform_updated_at')->nullable()->after('active_platform');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['active_platform', 'active_platform_updated_at']);
        });
    }
};
