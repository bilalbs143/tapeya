<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Interest is submit-once — remove withdraw status and withdrawn_at.
 * Former withdrawn rows are deleted so those users can submit again if needed.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('tournament_interest_submissions')
            ->where('status', 'withdrawn')
            ->delete();

        Schema::table('tournament_interest_submissions', function (Blueprint $table) {
            $table->dropColumn('withdrawn_at');
        });
    }

    public function down(): void
    {
        Schema::table('tournament_interest_submissions', function (Blueprint $table) {
            $table->timestamp('withdrawn_at')->nullable()->after('status');
        });
    }
};
