<?php

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
        Schema::create('membership_commission_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('level')->index();
            $table->float('new_signup_first_recharge_bonus')->default(0);
            $table->double('new_signup_first_recharge_bonus_maximum_amount')->default(0);
            $table->float('first_recharge_bonus_of_day')->default(0);
            $table->double('first_recharge_bonus_of_day_maximum_amount')->default(0);
            $table->float('bonus_per_recharge')->default(0);
            $table->double('bonus_per_recharge_maximum_amount')->default(0);
            $table->auditFields();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_commission_settings');
    }
};
