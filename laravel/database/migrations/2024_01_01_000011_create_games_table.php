<?php

use App\Models\Company;
use App\Models\Provider;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class)->index()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Provider::class)->index()->constrained()->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('sub_provider')->nullable();
            $table->string('game_id')->index();
            $table->string('launch_identifier')->index();
            $table->string('name');
            $table->text('image_url')->nullable();
            $table->string('game_id_numeric')->nullable();
            $table->string('type')->index()->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_live_game')->default(true);
            $table->boolean('is_enabled')->default(true);
            $table->boolean('has_freespins')->default(false);
            $table->boolean('has_jackpot')->default(false);
            $table->boolean('is_slot_game')->default(false);
            $table->boolean('is_demo_game_available')->default(false);
            $table->boolean('is_new')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->boolean('is_video_slot')->default(false);
            $table->boolean('is_arcade_slot')->default(false);
            $table->boolean('is_casual_slot')->default(false);
            $table->boolean('is_fishing_slot')->default(false);
            $table->boolean('is_table_casino')->default(false);
            $table->boolean('is_blackjack_casino')->default(false);
            $table->boolean('is_baccarat_casino')->default(false);
            $table->boolean('is_roulette_casino')->default(false);
            $table->boolean('is_poker')->default(false);
            $table->boolean('is_recommended')->default(false);
            $table->boolean('is_sport')->default(false);
            $table->boolean('is_lobby_game')->default(false);
            $table->date('released_at')->nullable()->comment('Date of release. Game can\'t be launched before this date');
            $table->date('recalled_at')->nullable()->comment('Date of recall. Game can\'t be launched after this date');
            $table->jsonb('jurisdictions')->default(new Expression("'{}'::jsonb"));
            $table->jsonb('game')->default(new Expression("'{}'::jsonb"));
            $table->timestamp('disabled_at')->nullable();
            $table->timestamp('disabled_by_admin_at')->nullable();
            $table->auditFields();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
