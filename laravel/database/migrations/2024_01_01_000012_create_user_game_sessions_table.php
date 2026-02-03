<?php

use App\Models\Company;
use App\Models\Game;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->index()->constrained('users')->references('id')->cascadeOnDelete();
            $table->foreignIdFor(Game::class)->index()->constrained('games')->references('id')->cascadeOnDelete();
            $table->foreignIdFor(Company::class)->index()->constrained('companies')->references('id')->cascadeOnDelete();
            $table->foreignIdFor(Provider::class)->index()->constrained('providers')->references('id')->cascadeOnDelete();
            $table->ipAddress('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('token')->index()->nullable();
            $table->text('launch_url')->nullable();
            $table->timestamp('requested_at')->index()->nullable();
            $table->timestamp('started_at')->index()->nullable();
            $table->timestamp('ended_at')->index()->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->auditFields();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_game_sessions');
    }
};
