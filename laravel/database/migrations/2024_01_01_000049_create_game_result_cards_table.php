<?php

use App\Models\Company;
use App\Models\Game;
use App\Models\Provider;
use App\Models\Transaction;
use App\Models\User;
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
        Schema::create('game_result_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->index()->constrained('users')->references('id')->nullOnDelete();
            $table->foreignIdFor(Game::class)->index()->constrained('games')->references('id')->nullOnDelete();
            $table->foreignIdFor(Company::class)->index()->constrained('companies')->references('id')->nullOnDelete();
            $table->foreignIdFor(Provider::class)->index()->constrained('providers')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class)->index()->constrained('transactions')->references('id')->cascadeOnDelete();
            $table->string('round_id')->index();
            $table->string('type')->index()->nullable();
            $table->string('status')->index();
            $table->jsonb('raw_data')->default(new Expression("'{}'::jsonb"));
            $table->jsonb('data')->default(new Expression("'{}'::jsonb"));
            $table->dateTime('fetched_at')->index()->nullable();
            $table->auditFields();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_result_cards');
    }
};
