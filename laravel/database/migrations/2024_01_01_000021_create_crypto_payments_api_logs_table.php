<?php

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
        Schema::create('crypto_payments_api_logs', function (Blueprint $table) {
            $table->id();
            $table->string('gateway')->default(PaymentGatewayEnum::NOWPAYMENTS->value)->after('id')->comment('Payment gateway provider');
            $table->string('endpoint'); // API endpoint being called
            $table->string('method', 10); // HTTP method (GET, POST, etc.)
            $table->text('request_data')->nullable(); // Request payload
            $table->text('response_data')->nullable(); // Response data
            $table->integer('response_status')->nullable(); // HTTP status code
            $table->string('user_id')->nullable(); // User making the request
            $table->string('ip_address')->nullable(); // IP address
            $table->string('session_id')->nullable(); // Session identifier
            $table->string('type'); // Request type (payment, payout, validation, verification, status)
            $table->string('status'); // Request outcome
            $table->text('error_message')->nullable(); // Error details if failed
            $table->decimal('processing_time', 8, 4)->nullable(); // Request processing time in seconds
            $table->json('metadata')->nullable(); // Additional context data
            $table->timestamps(); // Created and updated timestamps

            // Indexes for better query performance
            $table->index(['endpoint', 'created_at']);
            $table->index(['type', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index(['gateway', 'created_at']);
            $table->index(['gateway', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crypto_payments_api_logs');
    }
};
