<?php

namespace App\Http\Controllers\v1\Admin\Settlements;

use App\Http\Controllers\v1\Admin\BaseAdminController;
use App\Http\Resources\v1\Settlements\UserDailySettlementResource;
use App\Models\Settlements\UserDailySettlement;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;

class UserDailySettlementsController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(UserDailySettlement::class, UserDailySettlementResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->with('user', 'user.bank_account')->filterByAgent()->filterByAgentRole();
    }

    public function index()
    {
        $records = QueryBuilder::for($this->baseQuery())
            ->allowedFilters($this->model->getFilters())
            ->defaultSort('-id')
            ->allowedSorts($this->model->getSorts())
            ->select(
                DB::raw('DATE(date) as date'),
                DB::raw('SUM(deposited_money) as deposited_money'),
                DB::raw('SUM(deposited_money_count) as deposited_money_count'),
                DB::raw('SUM(deposited_money_by_admin) as deposited_money_by_admin'),
                DB::raw('SUM(deposited_money_by_admin_count) as deposited_money_by_admin_count'),
                DB::raw('SUM(withdrawal_money) as withdrawal_money'),
                DB::raw('SUM(withdrawal_money_count) as withdrawal_money_count'),
                DB::raw('SUM(withdrawal_money_by_admin) as withdrawal_money_by_admin'),
                DB::raw('SUM(withdrawal_money_by_admin_count) as withdrawal_money_by_admin_count'),
                DB::raw('SUM(points) as points'),
                DB::raw('SUM(points_credited_by_admin) as points_credited_by_admin'),
                DB::raw('SUM(points_credited_by_admin_count) as points_credited_by_admin_count'),
                DB::raw('SUM(points_credited_by_referal_code) as points_credited_by_referal_code'),
                DB::raw('SUM(points_credited_by_referal_code_count) as points_credited_by_referal_code_count'),
                DB::raw('SUM(points_credited_by_losing_bet) as points_credited_by_losing_bet'),
                DB::raw('SUM(points_credited_by_losing_bet_count) as points_credited_by_losing_bet_count'),
                DB::raw('SUM(points_debited_by_admin) as points_debited_by_admin'),
                DB::raw('SUM(points_debited_by_admin_count) as points_debited_by_admin_count'),
                DB::raw('SUM(points_exchange) as points_exchange'),
                DB::raw('SUM(points_exchange_count) as points_exchange_count'),
                DB::raw('SUM(coupon_points) as coupon_points'),
                DB::raw('SUM(coupon_points_credited_by_admin) as coupon_points_credited_by_admin'),
                DB::raw('SUM(coupon_points_credited_by_admin_count) as coupon_points_credited_by_admin_count'),
                DB::raw('SUM(coupon_points_debited_by_admin) as coupon_points_debited_by_admin'),
                DB::raw('SUM(coupon_points_debited_by_admin_count) as coupon_points_debited_by_admin_count'),
                DB::raw('SUM(coupon_points_credited_by_agent) as coupon_points_credited_by_agent'),
                DB::raw('SUM(coupon_points_credited_by_agent_count) as coupon_points_credited_by_agent_count'),
                DB::raw('SUM(coupon_points_debited_by_agent) as coupon_points_debited_by_agent'),
                DB::raw('SUM(coupon_points_debited_by_agent_count) as coupon_points_debited_by_agent_count'),
                DB::raw('SUM(coupon_points_distribution_payment_by_agent) as coupon_points_distribution_payment_by_agent'),
                DB::raw('SUM(coupon_points_distribution_payment_by_agent_count) as coupon_points_distribution_payment_by_agent_count'),
                DB::raw('SUM(coupon_points_distribution_recovery_by_agent) as coupon_points_distribution_recovery_by_agent'),
                DB::raw('SUM(coupon_points_distribution_recovery_by_agent_count) as coupon_points_distribution_recovery_by_agent_count'),
                DB::raw('SUM(coupon_points_exchange) as coupon_points_exchange'),
                DB::raw('SUM(coupon_points_exchange_count) as coupon_points_exchange_count'),
                DB::raw('SUM(holding_money) as holding_money'),
                DB::raw('SUM(total_holding_money) as total_holding_money'),
                DB::raw('SUM(total_points) as total_points'),
                DB::raw('SUM(total_coupon_points) as total_coupon_points'),
                DB::raw('SUM(total_losing_money) as total_losing_money'),
                DB::raw('SUM(total_rolling_money) as total_rolling_money'),
                DB::raw('SUM(total_betting_money) as total_betting_money'),
                DB::raw('SUM(total_betting_amount_slot) as total_betting_amount_slot'),
                DB::raw('SUM(total_betting_amount_casino) as total_betting_amount_casino'),
                DB::raw('SUM(total_refunded_money) as total_refunded_money'),
                DB::raw('SUM(total_refunded_amount_slot) as total_refunded_amount_slot'),
                DB::raw('SUM(total_refunded_amount_casino) as total_refunded_amount_casino'),
                DB::raw('SUM(total_net_betting_money) as total_net_betting_money'),
                DB::raw('SUM(total_net_betting_amount_slot) as total_net_betting_amount_slot'),
                DB::raw('SUM(total_net_betting_amount_casino) as total_net_betting_amount_casino'),
                DB::raw('SUM(total_winning_money) as total_winning_money'),
                DB::raw('SUM(total_winning_amount_slot) as total_winning_amount_slot'),
                DB::raw('SUM(total_winning_amount_casino) as total_winning_amount_casino'),
                DB::raw('SUM(total_canceled_money) as total_canceled_money'),
                DB::raw('SUM(total_canceled_amount_slot) as total_canceled_amount_slot'),
                DB::raw('SUM(total_canceled_amount_casino) as total_canceled_amount_casino'),
                DB::raw('SUM(total_net_winning_money) as total_net_winning_money'),
                DB::raw('SUM(total_net_winning_amount_slot) as total_net_winning_amount_slot'),
                DB::raw('SUM(total_net_winning_amount_casino) as total_net_winning_amount_casino'),
                DB::raw('SUM(total_betting_difference) as total_betting_difference'),
                DB::raw('SUM(total_betting_difference_slot) as total_betting_difference_slot'),
                DB::raw('SUM(total_betting_difference_casino) as total_betting_difference_casino'),
                DB::raw('SUM(total_net_betting_difference) as total_net_betting_difference'),
                DB::raw('SUM(total_net_betting_difference_slot) as total_net_betting_difference_slot'),
                DB::raw('SUM(total_net_betting_difference_casino) as total_net_betting_difference_casino'),
                DB::raw('SUM(total_jackpot_money) as total_jackpot_money'),
                DB::raw('SUM(total_bonus_money) as total_bonus_money'),
                DB::raw('SUM(total_promo_win_money) as total_promo_win_money'),
                DB::raw('SUM(first_recharge_bonus_points_after_signup) as first_recharge_bonus_points_after_signup'),
                DB::raw('SUM(first_recharge_bonus_points_after_signup_count) as first_recharge_bonus_points_after_signup_count'),
                DB::raw('SUM(first_recharge_bonus_points_of_day) as first_recharge_bonus_points_of_day'),
                DB::raw('SUM(first_recharge_bonus_points_of_day_count) as first_recharge_bonus_points_of_day_count'),
                DB::raw('SUM(per_recharge_bonus_points) as per_recharge_bonus_points'),
                DB::raw('SUM(per_recharge_bonus_points_count) as per_recharge_bonus_points_count'),
                DB::raw('SUM(rolling_money) as rolling_money'),
                DB::raw('SUM(rolling_money_credited) as rolling_money_credited'),
                DB::raw('SUM(rolling_money_credited_count) as rolling_money_credited_count'),
                DB::raw('SUM(rolling_money_withdrawal) as rolling_money_withdrawal'),
                DB::raw('SUM(rolling_money_withdrawal_count) as rolling_money_withdrawal_count'),
                DB::raw('SUM(losing_money) as losing_money'),
                DB::raw('SUM(losing_money_credited) as losing_money_credited'),
                DB::raw('SUM(losing_money_credited_count) as losing_money_credited_count'),
                DB::raw('SUM(losing_money_debited) as losing_money_debited'),
                DB::raw('SUM(losing_money_debited_count) as losing_money_debited_count'),
                DB::raw('SUM(losing_money_withdrawal) as losing_money_withdrawal'),
                DB::raw('SUM(losing_money_withdrawal_count) as losing_money_withdrawal_count'),
                DB::raw('SUM(betting_money) as betting_money'),
                DB::raw('SUM(refunded_money) as refunded_money'),
                DB::raw('SUM(net_betting_money) as net_betting_money'),
                DB::raw('SUM(winning_money) as winning_money'),
                DB::raw('SUM(canceled_money) as canceled_money'),
                DB::raw('SUM(net_winning_money) as net_winning_money'),
                DB::raw('SUM(betting_difference) as betting_difference'),
                DB::raw('SUM(net_betting_difference) as net_betting_difference'),
                DB::raw('SUM(jackpot_money) as jackpot_money'),
                DB::raw('SUM(bonus_money) as bonus_money'),
                DB::raw('SUM(promo_win_money) as promo_win_money'),
                DB::raw('SUM(approved_members_count) as approved_members_count'),
                DB::raw('SUM(requested_members_count) as requested_members_count'),
            )
            ->groupBy('date')
            ->when(
                request()->has('all'),
                fn ($query) => $query->get(),
                fn ($query) => $query->pagination()
            );

        return $this->resource::collection($records);
    }
}
