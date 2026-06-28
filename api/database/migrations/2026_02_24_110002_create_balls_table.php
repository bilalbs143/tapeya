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

            $table->unsignedSmallInteger('over');
            $table->unsignedTinyInteger('ball_in_over');

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
            $table->string('no_ball_type', 50)->nullable();
            $table->string('no_ball_runs_type', 20)->nullable();
            $table->string('overthrow_delivery_type', 20)->nullable();
            $table->boolean('is_wide')->default(false);
            $table->boolean('is_leg_bye')->default(false);
            $table->boolean('is_bye')->default(false);
            $table->boolean('is_free_hit')
                ->default(false)
                ->comment('True when this delivery is a free-hit (follows a no-ball).');
            $table->smallInteger('penalty_runs')->default(0);
            $table->string('penalty_team', 20)->nullable();
            $table->string('penalty_reason', 100)->nullable();
            $table->unsignedTinyInteger('additional_runs')->nullable();

            $table->boolean('is_wicket')->default(false);
            $table->string('dismissal_type', 30)->nullable();
            $table->foreignId('out_player_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('fielder_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('runout_extra_runs')->nullable();
            $table->string('runout_run_type', 20)->nullable();
            $table->boolean('batter_crossed')->nullable();
            $table->boolean('dont_count_ball')->default(false);
            $table->string('dismissal_delivery_type', 20)->nullable();

            $table->string('shot_position', 30)->nullable();

            $table->timestamps();

            $table->unique(['innings_id', 'over', 'ball_in_over'], 'balls_innings_over_ball_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('balls');
    }
};
