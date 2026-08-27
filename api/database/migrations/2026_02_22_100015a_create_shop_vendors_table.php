<?php

use App\Enums\Shop\VendorStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_vendors');
    }
};
