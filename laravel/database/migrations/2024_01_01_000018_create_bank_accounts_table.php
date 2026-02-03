<?php

use App\Models\Bank;
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
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Bank::class)->constrained()->cascadeOnDelete();
            $table->string('logo_path')->nullable();
            $table->string('account_holder_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('qr_code_path')->nullable();
            $table->string('type')->nullable();
            $table->boolean('is_active')->default(true);
            $table->double('min_deposit_amount')->default(0);
            $table->double('max_deposit_amount')->default(0);
            $table->double('bank_transaction_fee')->default(0);
            $table->double('bank_transaction_subsidi')->default(0);
            $table->auditFields();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
