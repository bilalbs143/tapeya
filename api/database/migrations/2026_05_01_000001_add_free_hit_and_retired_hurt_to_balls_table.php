<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add free-hit flag and retired-hurt dismissal support to the balls table.
 *
 * is_free_hit (bool, default false)
 *   Set to true on the delivery that follows a no-ball. On a free-hit, the
 *   batter may only be dismissed by run-out, obstructing the field, or hitting
 *   the ball twice. If the free-hit ball is itself a no-ball or wide, the
 *   free-hit flag carries over to the next delivery (backend validation only
 *   cares that the flag is stored correctly; carry-over logic lives in the app).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            $table->boolean('is_free_hit')
                ->default(false)
                ->after('is_bye')
                ->comment('True when this delivery is a free-hit (follows a no-ball).');
        });
    }

    public function down(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            $table->dropColumn('is_free_hit');
        });
    }
};
