<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();

            $table->string('kind', 20)->default('tournament');
            $table->foreignId('tournament_id')
                ->nullable()
                ->constrained('tournaments')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('group_index')->nullable();

            $table->foreignId('home_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->foreignId('away_team_id')
                ->constrained('teams')
                ->cascadeOnDelete();

            $table->date('match_date');
            $table->time('match_time');
            $table->string('venue_name')->nullable();
            $table->unsignedTinyInteger('players_per_side')->default(11);
            $table->unsignedTinyInteger('overs')->default(20);
            $table->string('cricket_format', 30)->nullable();

            $table->string('status', 20)->default('scheduled');
            $table->string('stream_provider_override', 30)->nullable();
            $table->string('cancel_reason', 50)->nullable();
            $table->text('cancel_comments')->nullable();
            $table->boolean('cancel_points_awarded_each')->default(false);
            $table->string('declare_result_type', 20)->nullable();
            $table->foreignId('declare_winner_team_id')
                ->nullable()
                ->constrained('teams')
                ->nullOnDelete();
            $table->text('declare_result_note')->nullable();
            $table->boolean('wagon_wheel_enabled')->default(false);
            $table->jsonb('pending_crease')->nullable();
            $table->unsignedSmallInteger('revised_target')->nullable();
            $table->timestamp('revised_target_at')->nullable();
            $table->string('stream_thumbnail')->nullable();

            $table->foreignId('winning_team_id')
                ->nullable()
                ->constrained('teams')
                ->nullOnDelete();
            $table->foreignId('toss_winner_team_id')
                ->nullable()
                ->constrained('teams')
                ->nullOnDelete();
            $table->string('chose_to_bat_or_bowl', 10)->nullable();
            $table->boolean('is_no_result')->default(false);
            $table->unsignedSmallInteger('win_by_runs')->nullable();
            $table->unsignedTinyInteger('win_by_wickets')->nullable();
            $table->foreignId('player_of_match_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
