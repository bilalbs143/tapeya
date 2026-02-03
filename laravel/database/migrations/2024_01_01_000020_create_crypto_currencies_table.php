<?php

use App\Enums\Currency\CurrencyTypeEnum;
use App\Enums\CryptoPayments\PaymentGatewayEnum;
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
        Schema::create('crypto_currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('e.g., btc, eth, maticmainnet');
            $table->string('gateway')->default(PaymentGatewayEnum::NOWPAYMENTS->value)->after('code')->comment('Payment gateway provider');
            $table->string('name')->nullable()->comment('e.g., Bitcoin, Ethereum');
            $table->text('logo_url')->nullable()->comment('Icon URL from NowPayments');
            $table->string('category')->default(CurrencyTypeEnum::TOKENS->value);
            $table->boolean('enabled')->default(true); // Can be disabled manually
            $table->integer('priority')->default(100); // For sorting
            $table->string('network')->nullable()->comment('e.g., eth, bsc');
            $table->boolean('is_maxlimit')->default(false);
            $table->boolean('is_popular')->default(false)->after('is_maxlimit');
            $table->boolean('is_stable')->default(false)->after('is_popular');
            $table->decimal('network_precision', 8, 0)->nullable();
            $table->text('wallet_regex')->nullable();
            $table->json('extra_data')->nullable()->comment('Store additional API data');
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'enabled']);
            $table->index(['enabled', 'priority']);
            $table->index(['gateway', 'enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crypto_currencies');
    }
};
