<?php

use App\Enums\Currency\CurrencyEnum;
use App\Enums\Membership\LevelsEnum;
use App\Enums\User\UserLocaleEnum;
use App\Enums\User\UserStatusEnum;
use App\Enums\User\UserTypeEnum;
use App\Models\User;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class, 'parent_id')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->foreignIdFor(User::class, 'referred_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete()->after('parent_id');
            $table->string('type')->default(UserTypeEnum::USER->value)->index();
            $table->string('currency')->default(CurrencyEnum::KRW->value)->index();
            $table->string('name')->index();
            $table->string('nickname')->nullable()->index();
            $table->string('ref_code')->nullable()->unique();
            $table->string('referral_link_qr_code_path')->nullable()->after('ref_code');
            $table->timestamp('referral_link_qr_code_expires_at')->nullable()->after('referral_link_qr_code_path');
            $table->string('image')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('locale', 10)->default(UserLocaleEnum::ko->value);
            $table->string('phone')->nullable()->unique();
            $table->string('dob')->nullable();
            $table->boolean('is_new_signup_first_recharge_bonus_enabled')->default(true);
            $table->boolean('is_first_recharge_bonus_of_day_enabled')->default(true);
            $table->boolean('is_bonus_per_recharge_enabled')->default(true);
            $table->boolean('is_weekly_loss_bonus_enabled')->default(true)->after('is_bonus_per_recharge_enabled');
            $table->float('losing_point_ratio')->nullable();
            $table->float('rolling_ratio')->nullable();
            $table->integer('level')->nullable()->default(LevelsEnum::LEVEL_1->value);
            $table->float('referral_bonus_percentage')->nullable()->default(null);
            $table->text('referral_bonus_percentage_memo')->nullable();
            $table->text('memo')->nullable();
            $table->ipAddress('created_at_ip')->nullable();
            $table->string('status')->default(UserStatusEnum::PENDING->value)->index();
            $table->boolean('is_test')->default(false);
            $table->timestamp('blocked_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignIdFor(User::class, 'approved_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignIdFor(User::class, 'rejected_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->string('blocked_reason')->nullable();
            $table->foreignIdFor(User::class, 'blocked_by')->nullable()->index()->constrained('users')->references('id')->nullOnDelete();
            $table->rememberToken();
            $table->auditFields();

            $table->index('referral_link_qr_code_expires_at');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
