<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('can_broadcast')->default(false)->after('active_platform_updated_at');
            $table->timestamp('broadcast_terms_accepted_at')->nullable()->after('can_broadcast');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['can_broadcast', 'broadcast_terms_accepted_at']);
        });
    }
};
