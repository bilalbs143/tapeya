<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            $table->string('no_ball_type', 50)->nullable()->after('is_no_ball');
            $table->string('no_ball_runs_type', 20)->nullable()->after('no_ball_type');
            $table->string('overthrow_delivery_type', 20)->nullable()->after('no_ball_runs_type');

            $table->string('penalty_team', 20)->nullable()->after('penalty_runs');
            $table->string('penalty_reason', 100)->nullable()->after('penalty_team');
            $table->unsignedTinyInteger('additional_runs')->nullable()->after('penalty_reason');

            $table->unsignedTinyInteger('runout_extra_runs')->nullable()->after('fielder_id');
            $table->string('runout_run_type', 20)->nullable()->after('runout_extra_runs');
            // batter_crossed: three-state boolean.
            //   null  — not a run-out ball (field is not applicable)
            //   true  — batters had crossed when the wicket fell (incoming batter takes striker's end)
            //   false — batters had NOT crossed (incoming batter takes non-striker's end)
            // Used by InningsStatsService::creaseAfterDismissalBall() for crease resolution.
            $table->boolean('batter_crossed')->nullable()->after('runout_run_type');
            // dont_count_ball: true for retired/obstruct dismissals where the delivery
            // is excluded from the over ball count (Law-permitted; not a wide/no-ball).
            $table->boolean('dont_count_ball')->default(false)->after('batter_crossed');
            $table->string('dismissal_delivery_type', 20)->nullable()->after('dont_count_ball');
        });

        Schema::table('balls', function (Blueprint $table) {
            // Named composite index for scorecard ordering and nextBallPosition().
            // Runs after 2026_05_15 unique constraint migration; the original unnamed
            // index may already be gone — drop is guarded.
            if ($this->indexExists('balls_innings_id_over_ball_in_over_index')) {
                $table->dropIndex('balls_innings_id_over_ball_in_over_index');
            }

            if (! $this->indexExists('balls_innings_over_position_index')) {
                $table->index(['innings_id', 'over', 'ball_in_over'], 'balls_innings_over_position_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('balls', function (Blueprint $table) {
            if ($this->indexExists('balls_innings_over_position_index')) {
                $table->dropIndex('balls_innings_over_position_index');
            }

            if (! $this->indexExists('balls_innings_id_over_ball_in_over_index')) {
                $table->index(['innings_id', 'over', 'ball_in_over']);
            }
        });

        Schema::table('balls', function (Blueprint $table) {
            $table->dropColumn([
                'no_ball_type',
                'no_ball_runs_type',
                'overthrow_delivery_type',
                'penalty_team',
                'penalty_reason',
                'additional_runs',
                'runout_extra_runs',
                'runout_run_type',
                'batter_crossed',
                'dont_count_ball',
                'dismissal_delivery_type',
            ]);
        });
    }

    /** Check whether a named index exists on the balls table (PostgreSQL). */
    private function indexExists(string $indexName): bool
    {
        return (bool) DB::selectOne(
            "SELECT 1 FROM pg_indexes WHERE tablename = 'balls' AND indexname = ?",
            [$indexName],
        );
    }
};
