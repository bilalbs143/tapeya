<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('balls', function (Blueprint $table) {
            $table->id();

            $table->foreignId('innings_id')
                ->constrained('innings')
                ->cascadeOnDelete();

            $table->unsignedSmallInteger('over'); // over number (0-based or 1-based)
            $table->unsignedTinyInteger('ball_in_over'); // 1-6 (or 1-7 if no-ball counts as extra)

            $table->foreignId('striker_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('non_striker_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('bowler_id')
                ->constrained('users')
                ->cascadeOnDelete();

            /** Total runs from this delivery (including boundaries, overthrows, extras). */
            $table->unsignedTinyInteger('runs')->default(0);
            /** Runs attributed to the striker (off the bat). Enables correct batting stats. */
            $table->unsignedTinyInteger('runs_off_bat')->default(0);

            $table->boolean('is_no_ball')->default(false);
            $table->boolean('is_wide')->default(false);
            $table->boolean('is_leg_bye')->default(false);
            $table->boolean('is_bye')->default(false);
            $table->unsignedTinyInteger('penalty_runs')->default(0);

            $table->boolean('is_wicket')->default(false);
            $table->string('dismissal_type', 30)->nullable();
            $table->foreignId('out_player_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('fielder_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('shot_position', 30)->nullable();

            $table->timestamps();

            $table->index(['innings_id', 'over', 'ball_in_over']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('balls');
    }
};
