<?php

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
        Schema::create('user_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->index()->constrained('users')->cascadeOnDelete();
            $table->double('holding_money')->default(0);
            $table->double('points')->default(0);
            $table->double('points_exchange')->default(0);
            $table->unsignedInteger('points_exchange_count')->default(0);
            $table->double('rolling_money')->default(0);
            $table->double('rolling_money_credited')->default(0);
            $table->unsignedInteger('rolling_money_credited_count')->default(0);
            $table->datetime('last_rolling_money_credited_at')->nullable();
            $table->double('rolling_money_withdrawal')->default(0);
            $table->unsignedInteger('rolling_money_withdrawal_count')->default(0);
            $table->datetime('last_rolling_money_withdrawal_at')->nullable();
            $table->double('losing_money')->default(0);
            $table->double('losing_money_credited')->default(0);
            $table->unsignedInteger('losing_money_credited_count')->default(0);
            $table->datetime('last_losing_money_credited_at')->nullable();
            $table->double('losing_money_debited')->default(0);
            $table->unsignedInteger('losing_money_debited_count')->default(0);
            $table->datetime('last_losing_money_debited_at')->nullable();
            $table->double('losing_money_withdrawal')->default(0);
            $table->unsignedInteger('losing_money_withdrawal_count')->default(0);
            $table->datetime('last_losing_money_withdrawal_at')->nullable();
            $table->double('coupon_points')->default(0);
            $table->double('coupon_points_exchange')->default(0);
            $table->unsignedInteger('coupon_points_exchange_count')->default(0);
            $table->double('deposited_money')->default(0);
            $table->unsignedInteger('deposited_money_count')->default(0);
            $table->double('deposited_money_by_admin')->default(0);
            $table->unsignedInteger('deposited_money_by_admin_count')->default(0);
            $table->double('withdrawal_money')->default(0);
            $table->unsignedInteger('withdrawal_money_count')->default(0);
            $table->double('withdrawal_money_by_admin')->default(0);
            $table->unsignedInteger('withdrawal_money_by_admin_count')->default(0);
            $table->datetime('last_deposited_money_at')->nullable();
            $table->datetime('last_deposited_money_by_admin_at')->nullable();
            $table->datetime('last_withdrawal_money_at')->nullable();
            $table->datetime('last_withdrawal_money_by_admin_at')->nullable();
            $table->datetime('last_points_exchanged_at')->nullable();
            $table->datetime('last_coupon_points_exchanged_at')->nullable();
            $table->double('points_credited_by_admin')->default(0);
            $table->unsignedInteger('points_credited_by_admin_count')->default(0);
            $table->datetime('last_points_credited_by_admin_at')->nullable();
            $table->double('points_debited_by_admin')->default(0);
            $table->unsignedInteger('points_debited_by_admin_count')->default(0);
            $table->datetime('last_points_debited_by_admin_at')->nullable();
            $table->double('coupon_points_credited_by_admin')->default(0);
            $table->unsignedInteger('coupon_points_credited_by_admin_count')->default(0);
            $table->datetime('last_coupon_points_credited_by_admin_at')->nullable();
            $table->double('coupon_points_debited_by_admin')->default(0);
            $table->unsignedInteger('coupon_points_debited_by_admin_count')->default(0);
            $table->datetime('last_coupon_points_debited_by_admin_at')->nullable();
            $table->double('coupon_points_credited_by_agent')->default(0);
            $table->unsignedInteger('coupon_points_credited_by_agent_count')->default(0);
            $table->datetime('last_coupon_points_credited_by_agent_at')->nullable();
            $table->double('coupon_points_debited_by_agent')->default(0);
            $table->unsignedInteger('coupon_points_debited_by_agent_count')->default(0);
            $table->datetime('last_coupon_points_debited_by_agent_at')->nullable();
            $table->double('points_credited_by_referal_code')->default(0);
            $table->unsignedInteger('points_credited_by_referal_code_count')->default(0);
            $table->datetime('last_points_credited_by_referal_code_at')->nullable();
            $table->double('points_credited_by_losing_bet')->default(0);
            $table->unsignedInteger('points_credited_by_losing_bet_count')->default(0);
            $table->datetime('last_points_credited_by_losing_bet_at')->nullable();
            $table->double('promotion_points')->default(0);
            $table->unsignedInteger('promotion_points_count')->default(0);
            $table->datetime('last_promotion_points_at')->nullable();
            $table->double('total_holding_money')->default(0);
            $table->double('total_points')->default(0);
            $table->double('total_coupon_points')->default(0);
            $table->double('total_losing_money')->default(0);
            $table->double('total_rolling_money')->default(0);
            $table->double('total_betting_money')->default(0);
            $table->double('total_refunded_money')->default(0);
            $table->double('total_net_betting_money')->default(0);
            $table->double('total_winning_money')->default(0);
            $table->double('total_canceled_money')->default(0);
            $table->double('total_net_winning_money')->default(0);
            $table->double('total_betting_difference')->default(0)->comment('Positive = Profit, Negative = Loss');
            $table->double('total_net_betting_difference')->default(0)->comment('Positive = Profit, Negative = Loss');
            $table->double('total_jackpot_money')->default(0);
            $table->double('total_bonus_money')->default(0);
            $table->double('total_promo_win_money')->default(0);
            $table->double('total_betting_amount_slot')->default(0);
            $table->double('total_betting_amount_casino')->default(0);
            $table->double('total_refunded_amount_slot')->default(0);
            $table->double('total_refunded_amount_casino')->default(0);
            $table->double('total_net_betting_amount_slot')->default(0);
            $table->double('total_net_betting_amount_casino')->default(0);
            $table->double('total_winning_amount_slot')->default(0);
            $table->double('total_winning_amount_casino')->default(0);
            $table->double('total_canceled_amount_slot')->default(0);
            $table->double('total_canceled_amount_casino')->default(0);
            $table->double('total_net_winning_amount_slot')->default(0);
            $table->double('total_net_winning_amount_casino')->default(0);
            $table->double('total_betting_difference_slot')->default(0)->comment('Positive = Profit, Negative = Loss');
            $table->double('total_betting_difference_casino')->default(0)->comment('Positive = Profit, Negative = Loss');
            $table->double('total_net_betting_difference_slot')->default(0)->comment('Positive = Profit, Negative = Loss');
            $table->double('total_net_betting_difference_casino')->default(0)->comment('Positive = Profit, Negative = Loss');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_wallets');
    }
};
