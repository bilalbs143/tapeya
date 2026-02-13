<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('shop_products', 'compare_at_price')) {
            Schema::table('shop_products', function (Blueprint $table) {
                $table->dropColumn('compare_at_price');
            });
        }
    }

    public function down(): void
    {
        Schema::table('shop_products', function (Blueprint $table) {
            $table->decimal('compare_at_price', 12, 2)->nullable()->after('price');
        });
    }
};
