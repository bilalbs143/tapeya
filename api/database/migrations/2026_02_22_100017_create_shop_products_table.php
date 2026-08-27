<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('shop_vendors')->restrictOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('sku')->nullable();
            $table->decimal('price', 12, 2);
            $table->foreignId('brand_id')->nullable()->constrained('shop_brands')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('shop_categories')->nullOnDelete();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_special_offer')->default(false);
            $table->string('discount_type', 20)->nullable();
            $table->decimal('discount_value', 12, 2)->nullable();
            $table->timestamp('discount_starts_at')->nullable();
            $table->timestamp('discount_ends_at')->nullable();
            $table->timestamps();

            $table->unique(['vendor_id', 'slug']);
            $table->unique(['vendor_id', 'sku']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_products');
    }
};
