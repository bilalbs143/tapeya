<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->string('cancel_reason', 50)->nullable()->after('status');
            $table->text('cancel_comments')->nullable()->after('cancel_reason');
            $table->boolean('cancel_points_awarded_each')->default(false)->after('cancel_comments');

            $table->string('declare_result_type', 20)->nullable()->after('cancel_points_awarded_each');
            $table->foreignId('declare_winner_team_id')
                ->nullable()
                ->after('declare_result_type')
                ->constrained('teams')
                ->nullOnDelete();
            $table->text('declare_result_note')->nullable()->after('declare_winner_team_id');
            $table->boolean('wagon_wheel_enabled')->default(false)->after('declare_result_note');
            $table->unsignedSmallInteger('revised_target')->nullable()->after('wagon_wheel_enabled');
            $table->timestamp('revised_target_at')->nullable()->after('revised_target');
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('declare_winner_team_id');
            $table->dropColumn([
                'cancel_reason',
                'cancel_comments',
                'cancel_points_awarded_each',
                'declare_result_type',
                'declare_result_note',
                'wagon_wheel_enabled',
                'revised_target',
                'revised_target_at',
            ]);
        });
    }
};
