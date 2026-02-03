<?php

use App\Enums\Transaction\TransactionSourceEnum;
use App\Models\Company;
use App\Models\ExchangeRequest;
use App\Models\Game;
use App\Models\Provider;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserGameSession;
use App\Models\UserWallet;
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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->index()->constrained('users')->references('id')->cascadeOnDelete();
            $table->string('transaction_number')->unique()->index();
            $table->string('reference_number')->nullable();
            $table->string('txn_id')->index()->nullable();
            $table->string('category')->nullable()->index();
            $table->string('type')->index();
            $table->string('sub_type')->index();
            $table->double('before_money')->default(0);
            $table->double('money')->default(0);
            $table->double('after_money')->default(0);
            $table->foreignIdFor(UserWallet::class)->index()->constrained('user_wallets')->references('id')->cascadeOnDelete();
            $table->foreignIdFor(ExchangeRequest::class)->nullable()->index()->constrained('exchange_requests')->references('id')->nullOnDelete();
            $table->foreignIdFor(UserGameSession::class)->nullable()->index()->constrained('user_game_sessions')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class, 'source_transaction_id')->nullable()->index()->constrained('transactions')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class, 'reference_debit_transaction_id')->nullable()->index()->constrained('transactions')->references('id')->nullOnDelete();
            $table->foreignIdFor(Transaction::class, 'reference_credit_transaction_id')->nullable()->index()->constrained('transactions')->references('id')->nullOnDelete();
            $table->foreignId('transaction_result_id')->nullable()->index();
            $table->foreignIdFor(Game::class)->nullable()->index()->constrained('games')->references('id')->nullOnDelete();
            $table->foreignIdFor(Company::class)->nullable()->index()->constrained('companies')->references('id')->nullOnDelete();
            $table->foreignIdFor(Provider::class)->nullable()->index()->constrained('providers')->references('id')->nullOnDelete();
            $table->foreignIdFor(User::class, 'given_to')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->string('source')->default(TransactionSourceEnum::EXCHANGE_REQUEST->value)->index();
            $table->string('company_game_id')->nullable();
            $table->string('company_round_id')->nullable();
            $table->string('company_jackpot_id')->nullable();
            $table->string('company_campaign_id')->nullable();
            $table->string('company_campaign_type')->nullable();
            $table->jsonb('company_request_body')->default(new Expression("'{}'::jsonb"));
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('round_ended_at')->nullable();
            $table->timestamp('rolled_back_at')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('memo')->nullable();
            $table->auditFields();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
