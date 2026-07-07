<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournament_interest_campaigns', function (Blueprint $table) {
            $table->json('form_fields')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('tournament_interest_campaigns', function (Blueprint $table) {
            $table->dropColumn('form_fields');
        });
    }
};
