<?php

use App\Models\Company;
use App\Models\Game;
use App\Models\Provider;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserGameSession;
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
        Schema::create('transaction_results', function (Blueprint $table) {
            $table->id();
            $table->string('state');
            $table->foreignIdFor(User::class)->nullable()->index()->constrained('users')->references('id')->cascadeOnDelete();
            $table->foreignIdFor(UserGameSession::class)->nullable()->index()->constrained('user_game_sessions')->references('id')->nullOnDelete();
            $table->foreignIdFor(Game::class)->nullable()->index()->constrained('games')->references('id')->nullOnDelete();
            $table->foreignIdFor(Company::class)->nullable()->index()->constrained('companies')->references('id')->nullOnDelete();
            $table->foreignIdFor(Provider::class)->nullable()->index()->constrained('providers')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class, 'debit_transaction_id')->nullable()->index()->constrained('transactions')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class, 'credit_transaction_id')->nullable()->index()->constrained('transactions')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class, 'refund_transaction_id')->nullable()->index()->constrained('transactions')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class, 'cancel_transaction_id')->nullable()->index()->constrained('transactions')->references('id')->nullOnDelete();
            $table->float('debit_amount')->default(0);
            $table->float('before_debit')->default(0);
            $table->float('after_debit')->default(0);
            $table->float('credit_amount')->default(0);
            $table->float('before_credit')->default(0);
            $table->float('after_credit')->default(0);
            $table->float('refund_amount')->default(0);
            $table->float('before_refund')->default(0);
            $table->float('after_refund')->default(0);
            $table->float('cancel_amount')->default(0);
            $table->float('before_cancel')->default(0);
            $table->float('after_cancel')->default(0);
            $table->float('closing_balance')->default(0);
            $table->auditFields();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreign('transaction_result_id')
                ->references('id')
                ->on('transaction_results')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['transaction_result_id']);
        });

        Schema::dropIfExists('transaction_results');
    }
};
