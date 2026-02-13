<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shop_products', function (Blueprint $table) {
            if (! Schema::hasColumn('shop_products', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('is_active');
            }
            if (! Schema::hasColumn('shop_products', 'is_popular')) {
                $table->boolean('is_popular')->default(false)->after('is_featured');
            }
            if (! Schema::hasColumn('shop_products', 'is_special_offer')) {
                $table->boolean('is_special_offer')->default(false)->after('is_popular');
            }
        });
    }

    public function down(): void
    {
        Schema::table('shop_products', function (Blueprint $table) {
            $columns = array_filter(
                ['is_featured', 'is_popular', 'is_special_offer'],
                fn (string $col) => Schema::hasColumn('shop_products', $col)
            );
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
