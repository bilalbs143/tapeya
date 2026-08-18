<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_vendor_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('shop_orders')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('shop_vendors')->restrictOnDelete();
            $table->string('vendor_order_number')->unique();
            $table->string('status', 30)->default('pending');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('shipping_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('commission_rate_snapshot', 5, 2)->default(0);
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('vendor_earnings', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['order_id', 'vendor_id']);
            $table->index(['vendor_id', 'status']);
            $table->index(['vendor_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_vendor_orders');
    }
};
