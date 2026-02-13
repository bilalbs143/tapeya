<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shop_products', function (Blueprint $table) {
            if (! Schema::hasColumn('shop_products', 'discount_type')) {
                $table->string('discount_type', 20)->nullable()->after('is_special_offer');
            }
            if (! Schema::hasColumn('shop_products', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->nullable()->after('discount_type');
            }
            if (! Schema::hasColumn('shop_products', 'discount_starts_at')) {
                $table->timestamp('discount_starts_at')->nullable()->after('discount_value');
            }
            if (! Schema::hasColumn('shop_products', 'discount_ends_at')) {
                $table->timestamp('discount_ends_at')->nullable()->after('discount_starts_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shop_products', function (Blueprint $table) {
            $columns = array_filter(
                ['discount_type', 'discount_value', 'discount_starts_at', 'discount_ends_at'],
                fn (string $col) => Schema::hasColumn('shop_products', $col)
            );
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
