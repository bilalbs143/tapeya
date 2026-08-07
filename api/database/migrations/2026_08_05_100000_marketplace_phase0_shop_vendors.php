<?php

use App\Enums\Shop\PaymentStatusEnum;
use App\Enums\Shop\ProductStatusEnum;
use App\Enums\Shop\VendorStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Marketplace: vendors, vendor-orders, inventory logs, payment fields.
 * Wipes transactional carts/orders; attaches existing products to the house vendor.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('store_name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('status', 30)->default(VendorStatusEnum::PENDING->value);
            $table->decimal('commission_rate', 5, 2)->nullable();
            $table->decimal('default_shipping_amount', 12, 2)->default(0);
            $table->boolean('is_platform')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->text('suspension_reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('is_platform');
        });

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

        Schema::create('shop_inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('shop_products')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('shop_vendors')->restrictOnDelete();
            $table->integer('delta');
            $table->unsignedInteger('quantity_after');
            $table->string('reason', 30);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
            $table->index(['vendor_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });

        // Wipe transactional shop data before requiring vendor FKs on line items.
        if (Schema::hasTable('shop_cart_items')) {
            DB::table('shop_cart_items')->delete();
        }
        if (Schema::hasTable('shop_carts')) {
            DB::table('shop_carts')->delete();
        }
        if (Schema::hasTable('shop_order_items')) {
            DB::table('shop_order_items')->delete();
        }
        if (Schema::hasTable('shop_orders')) {
            DB::table('shop_orders')->delete();
        }

        $now = now();
        $houseVendorId = DB::table('shop_vendors')->insertGetId([
            'user_id' => null,
            'store_name' => config('shop.house_vendor_store_name', 'Tapeya'),
            'slug' => config('shop.house_vendor_slug', 'tapeya-house'),
            'status' => VendorStatusEnum::APPROVED->value,
            'commission_rate' => null,
            'default_shipping_amount' => 0,
            'is_platform' => true,
            'approved_at' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        Schema::table('shop_products', function (Blueprint $table) {
            $table->foreignId('vendor_id')->nullable()->after('id')->constrained('shop_vendors')->restrictOnDelete();
            $table->string('status', 30)->default(ProductStatusEnum::PUBLISHED->value)->after('is_active');
        });

        DB::table('shop_products')->update([
            'vendor_id' => $houseVendorId,
            'status' => DB::raw("CASE WHEN is_active = true THEN '".ProductStatusEnum::PUBLISHED->value."' ELSE '".ProductStatusEnum::ARCHIVED->value."' END"),
        ]);

        Schema::table('shop_products', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropUnique(['sku']);
        });

        DB::statement('ALTER TABLE shop_products ALTER COLUMN vendor_id SET NOT NULL');

        Schema::table('shop_products', function (Blueprint $table) {
            $table->unique(['vendor_id', 'slug']);
            $table->unique(['vendor_id', 'sku']);
            $table->index(['vendor_id', 'status'], 'shop_products_vendor_id_status_index');
        });

        Schema::table('shop_orders', function (Blueprint $table) {
            $table->string('payment_status', 30)->default(PaymentStatusEnum::UNPAID->value)->after('status');
            $table->string('payment_method', 30)->nullable()->after('payment_status');
            $table->decimal('amount_received', 12, 2)->nullable()->after('payment_method');
            $table->timestamp('payment_verified_at')->nullable()->after('amount_received');
            $table->foreignId('payment_verified_by')->nullable()->after('payment_verified_at')->constrained('users')->nullOnDelete();
            $table->timestamp('placed_at')->nullable()->after('notes');
        });

        Schema::table('shop_order_items', function (Blueprint $table) {
            $table->foreignId('vendor_id')->after('order_id')->constrained('shop_vendors')->restrictOnDelete();
            $table->foreignId('vendor_order_id')->after('vendor_id')->constrained('shop_vendor_orders')->restrictOnDelete();
        });

        Schema::table('shop_cart_items', function (Blueprint $table) {
            $table->foreignId('vendor_id')->after('cart_id')->constrained('shop_vendors')->restrictOnDelete();
        });

        Schema::table('shop_carts', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('shop_carts', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });

        Schema::table('shop_cart_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vendor_id');
        });

        Schema::table('shop_order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vendor_order_id');
            $table->dropConstrainedForeignId('vendor_id');
        });

        Schema::table('shop_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('payment_verified_by');
            $table->dropColumn([
                'payment_status',
                'payment_method',
                'amount_received',
                'payment_verified_at',
                'placed_at',
            ]);
        });

        Schema::table('shop_products', function (Blueprint $table) {
            $table->dropIndex('shop_products_vendor_id_status_index');
            $table->dropUnique(['vendor_id', 'slug']);
            $table->dropUnique(['vendor_id', 'sku']);
            $table->dropConstrainedForeignId('vendor_id');
            $table->dropColumn('status');
            $table->unique('slug');
            $table->unique('sku');
        });

        Schema::dropIfExists('shop_inventory_logs');
        Schema::dropIfExists('shop_vendor_orders');
        Schema::dropIfExists('shop_vendors');
    }
};
