<?php

use App\Enums\Transaction\ExchangeRequestStatusEnum;
use App\Models\BankAccount;
use App\Models\User;
use App\Models\UserBank;
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
        Schema::create('exchange_requests', function (Blueprint $table) {
            $table->id();
            $table->string('type')->index();
            $table->ipAddress('ip_address')->nullable();
            $table->double('before_money')->nullable();
            $table->double('requested_money');
            $table->double('approved_money')->nullable();
            $table->double('after_money')->nullable();
            $table->foreignIdFor(UserBank::class)->nullable()->constrained('user_banks')->references('id')->nullOnDelete();
            $table->jsonb('bank')->nullable();
            $table->string('status')->default(ExchangeRequestStatusEnum::PENDING->value)->index();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable()->after('description')->comment('Additional data for crypto withdrawals, etc.');
            $table->boolean('is_first_request')->default(false);
            $table->string('via')->nullable();
            $table->string('gateway')->nullable()->after('via')->comment('Payment gateway used (nowpayments, cryptoments)');
            $table->foreignIdFor(BankAccount::class, 'bank_account_id')->nullable()->constrained('bank_accounts')->references('id')->nullOnDelete();
            $table->jsonb('receiving_bank')->nullable();
            $table->string('transaction_number')->nullable();
            $table->string('receipt_path')->nullable();
            $table->foreignIdFor(User::class, 'approved_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignIdFor(User::class, 'rejected_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->auditFields();

            $table->index(['gateway', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_requests');
    }
};
