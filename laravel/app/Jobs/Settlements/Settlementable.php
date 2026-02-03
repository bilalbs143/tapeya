<?php

namespace App\Jobs\Settlements;

use App\Models\Settlements\DailyCumulativeSettlement;
use App\Models\Settlements\DailySettlement;
use App\Models\Settlements\UserDailyCumulativeSettlement;
use App\Models\Settlements\UserDailySettlement;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserWallet;

trait Settlementable
{
    private function baseTransactionQuery(?User $user = null)
    {
        $baseQuery = Transaction::query();
        if ($user) {
            $baseQuery = $user->transactions();
        }

        return $baseQuery->yesterday();
    }

    private function aggregateUserWallet(string $prop, ?User $user = null)
    {
        if ($user) {
            return $user->wallet?->{$prop} ?: 0;
        }

        return UserWallet::sum($prop) ?: 0;
    }

    private function baseDailySettlementQuery(?User $user = null)
    {
        $baseQuery = DailySettlement::query();
        if ($user) {
            $baseQuery = UserDailySettlement::whereBelongsTo($user);
        }

        return $baseQuery->tillYesterday('date');
    }

    private function baseMemberQuery(?User $user = null, string $column = 'created_at')
    {
        return User::when($user, fn ($q) => $q->where('id', $user->id))->member()->yesterday($column);
    }

    public function getDailySettlementsArray(?User $user = null)
    {
        $data['approved_members_count'] = $this->baseMemberQuery($user, 'approved_at')->count();
        $data['requested_members_count'] = $this->baseMemberQuery($user)->count();
        $data['deposited_money'] = $this->baseTransactionQuery($user)->deposited()->sum('money');
        $data['deposited_money_count'] = $this->baseTransactionQuery($user)->deposited()->count();
        $data['deposited_money_by_admin'] = $this->baseTransactionQuery($user)->depositedByAdmin()->sum('money');
        $data['deposited_money_by_admin_count'] = $this->baseTransactionQuery($user)->depositedByAdmin()->count();
        $data['withdrawal_money'] = $this->baseTransactionQuery($user)->withdrawal()->sum('money');
        $data['withdrawal_money_count'] = $this->baseTransactionQuery($user)->withdrawal()->count();
        $data['withdrawal_money_by_admin'] = $this->baseTransactionQuery($user)->withdrawalByAdmin()->sum('money');
        $data['withdrawal_money_by_admin_count'] = $this->baseTransactionQuery($user)->withdrawalByAdmin()->count();
        $data['points'] = $this->aggregateUserWallet('points', $user);
        $data['points_credited_by_admin'] = $this->baseTransactionQuery($user)->pointsCreditedByAdmin()->sum('money');
        $data['points_credited_by_admin_count'] = $this->baseTransactionQuery($user)->pointsCreditedByAdmin()->count();
        $data['points_credited_by_referal_code'] = $this->baseTransactionQuery($user)->pointsCreditedByReferalCode()->sum('money');
        $data['points_credited_by_referal_code_count'] = $this->baseTransactionQuery($user)->pointsCreditedByReferalCode()->count();
        $data['points_credited_by_losing_bet'] = $this->baseTransactionQuery($user)->pointsCreditedByLosingBet()->sum('money');
        $data['points_credited_by_losing_bet_count'] = $this->baseTransactionQuery($user)->pointsCreditedByLosingBet()->count();
        $data['promotion_points'] = $this->baseTransactionQuery($user)->promotionPointsCredited()->sum('money');
        $data['promotion_points_count'] = $this->baseTransactionQuery($user)->promotionPointsCredited()->count();
        $data['points_debited_by_admin'] = $this->baseTransactionQuery($user)->pointsDebitedByAdmin()->sum('money');
        $data['points_debited_by_admin_count'] = $this->baseTransactionQuery($user)->pointsDebitedByAdmin()->count();
        $data['points_exchange'] = $this->baseTransactionQuery($user)->pointsExchanged()->sum('money');
        $data['points_exchange_count'] = $this->baseTransactionQuery($user)->pointsExchanged()->count();
        $data['coupon_points'] = $this->aggregateUserWallet('coupon_points', $user);
        $data['coupon_points_credited_by_admin'] = $this->baseTransactionQuery($user)->couponPointsCreditedByAdmin()->sum('money');
        $data['coupon_points_credited_by_admin_count'] = $this->baseTransactionQuery($user)->couponPointsCreditedByAdmin()->count();
        $data['coupon_points_debited_by_admin'] = $this->baseTransactionQuery($user)->couponPointsDebitedByAdmin()->sum('money');
        $data['coupon_points_debited_by_admin_count'] = $this->baseTransactionQuery($user)->couponPointsDebitedByAdmin()->count();
        $data['coupon_points_credited_by_agent'] = $this->baseTransactionQuery($user)->couponPointsCreditedByAgent()->sum('money');
        $data['coupon_points_credited_by_agent_count'] = $this->baseTransactionQuery($user)->couponPointsCreditedByAgent()->count();
        $data['coupon_points_debited_by_agent'] = $this->baseTransactionQuery($user)->couponPointsDebitedByAgent()->sum('money');
        $data['coupon_points_debited_by_agent_count'] = $this->baseTransactionQuery($user)->couponPointsDebitedByAgent()->count();
        $data['coupon_points_distribution_payment_by_agent'] = $this->baseTransactionQuery($user)->couponPointsDistributionPaymentByAgent()->sum('money');
        $data['coupon_points_distribution_payment_by_agent_count'] = $this->baseTransactionQuery($user)->couponPointsDistributionPaymentByAgent()->count();
        $data['coupon_points_distribution_recovery_by_agent'] = $this->baseTransactionQuery($user)->couponPointsDistributionRecoveryByAgent()->sum('money');
        $data['coupon_points_distribution_recovery_by_agent_count'] = $this->baseTransactionQuery($user)->couponPointsDistributionRecoveryByAgent()->count();
        $data['coupon_points_exchange'] = $this->baseTransactionQuery($user)->couponPointsExchanged()->sum('money');
        $data['coupon_points_exchange_count'] = $this->baseTransactionQuery($user)->couponPointsExchanged()->count();
        $data['holding_money'] = $this->aggregateUserWallet('holding_money', $user);
        $data['total_holding_money'] = $this->aggregateUserWallet('total_holding_money', $user);
        $data['total_points'] = $this->aggregateUserWallet('total_points', $user);
        $data['total_coupon_points'] = $this->aggregateUserWallet('total_coupon_points', $user);
        $data['total_losing_money'] = $this->aggregateUserWallet('total_losing_money', $user);
        $data['total_rolling_money'] = $this->aggregateUserWallet('total_rolling_money', $user);
        $data['total_betting_money'] = $this->aggregateUserWallet('total_betting_money', $user);
        $data['total_betting_amount_slot'] = $this->aggregateUserWallet('total_betting_amount_slot', $user);
        $data['total_betting_amount_casino'] = $this->aggregateUserWallet('total_betting_amount_casino', $user);
        $data['total_refunded_money'] = $this->aggregateUserWallet('total_refunded_money', $user);
        $data['total_refunded_amount_slot'] = $this->aggregateUserWallet('total_refunded_amount_slot', $user);
        $data['total_refunded_amount_casino'] = $this->aggregateUserWallet('total_refunded_amount_casino', $user);
        $data['total_net_betting_money'] = $this->aggregateUserWallet('total_net_betting_money', $user);
        $data['total_net_betting_amount_slot'] = $this->aggregateUserWallet('total_net_betting_amount_slot', $user);
        $data['total_net_betting_amount_casino'] = $this->aggregateUserWallet('total_net_betting_amount_casino', $user);
        $data['total_winning_money'] = $this->aggregateUserWallet('total_winning_money', $user);
        $data['total_winning_amount_slot'] = $this->aggregateUserWallet('total_winning_amount_slot', $user);
        $data['total_winning_amount_casino'] = $this->aggregateUserWallet('total_winning_amount_casino', $user);
        $data['total_canceled_money'] = $this->aggregateUserWallet('total_canceled_money', $user);
        $data['total_canceled_amount_slot'] = $this->aggregateUserWallet('total_canceled_amount_slot', $user);
        $data['total_canceled_amount_casino'] = $this->aggregateUserWallet('total_canceled_amount_casino', $user);
        $data['total_net_winning_money'] = $this->aggregateUserWallet('total_net_winning_money', $user);
        $data['total_net_winning_amount_slot'] = $this->aggregateUserWallet('total_net_winning_amount_slot', $user);
        $data['total_net_winning_amount_casino'] = $this->aggregateUserWallet('total_net_winning_amount_casino', $user);
        $data['total_betting_difference'] = $this->aggregateUserWallet('total_betting_difference', $user);
        $data['total_betting_difference_slot'] = $this->aggregateUserWallet('total_betting_difference_slot', $user);
        $data['total_betting_difference_casino'] = $this->aggregateUserWallet('total_betting_difference_casino', $user);
        $data['total_net_betting_difference'] = $this->aggregateUserWallet('total_net_betting_difference', $user);
        $data['total_net_betting_difference_slot'] = $this->aggregateUserWallet('total_net_betting_difference_slot', $user);
        $data['total_net_betting_difference_casino'] = $this->aggregateUserWallet('total_net_betting_difference_casino', $user);
        $data['total_jackpot_money'] = $this->aggregateUserWallet('total_jackpot_money', $user);
        $data['total_bonus_money'] = $this->aggregateUserWallet('total_bonus_money', $user);
        $data['total_promo_win_money'] = $this->aggregateUserWallet('total_promo_win_money', $user);
        $data['first_recharge_bonus_points_after_signup'] = $this->baseTransactionQuery($user)->firstRechargeBonusPointsAfterSignup()->sum('money');
        $data['first_recharge_bonus_points_after_signup_count'] = $this->baseTransactionQuery($user)->firstRechargeBonusPointsAfterSignup()->count();
        $data['first_recharge_bonus_points_of_day'] = $this->baseTransactionQuery($user)->firstRechargeBonusPointsOfDay()->sum('money');
        $data['first_recharge_bonus_points_of_day_count'] = $this->baseTransactionQuery($user)->firstRechargeBonusPointsOfDay()->count();
        $data['per_recharge_bonus_points'] = $this->baseTransactionQuery($user)->perRechargeBonusPoints()->sum('money');
        $data['per_recharge_bonus_points_count'] = $this->baseTransactionQuery($user)->perRechargeBonusPoints()->count();
        $data['rolling_money'] = $this->aggregateUserWallet('rolling_money', $user);
        $data['rolling_money_credited'] = $this->baseTransactionQuery($user)->rollingMoneyCredited()->sum('money');
        $data['rolling_money_credited_count'] = $this->baseTransactionQuery($user)->rollingMoneyCredited()->count();
        $data['rolling_money_withdrawal'] = $this->baseTransactionQuery($user)->rollingMoneyWithdrawal()->sum('money');
        $data['rolling_money_withdrawal_count'] = $this->baseTransactionQuery($user)->rollingMoneyWithdrawal()->count();
        $data['losing_money'] = $this->aggregateUserWallet('losing_money', $user);
        $data['losing_money_credited'] = $this->baseTransactionQuery($user)->losingMoneyCredited()->sum('money');
        $data['losing_money_credited_count'] = $this->baseTransactionQuery($user)->losingMoneyCredited()->count();
        $data['losing_money_debited'] = $this->baseTransactionQuery($user)->losingMoneyDebited()->sum('money');
        $data['losing_money_debited_count'] = $this->baseTransactionQuery($user)->losingMoneyDebited()->count();
        $data['losing_money_withdrawal'] = $this->baseTransactionQuery($user)->losingMoneyWithdrawal()->sum('money');
        $data['losing_money_withdrawal_count'] = $this->baseTransactionQuery($user)->losingMoneyWithdrawal()->count();
        $data['betting_money'] = $this->baseTransactionQuery($user)->bet()->sum('money');
        $data['refunded_money'] = $this->baseTransactionQuery($user)->refund()->sum('money');
        $data['net_betting_money'] = $data['betting_money'] - $data['refunded_money'];
        $data['winning_money'] = $this->baseTransactionQuery($user)->win()->sum('money');
        $data['canceled_money'] = $this->baseTransactionQuery($user)->cancel()->sum('money');
        $data['net_winning_money'] = $data['winning_money'] - $data['canceled_money'];
        $data['betting_difference'] = $data['winning_money'] - $data['betting_money'];
        $data['net_betting_difference'] = $data['net_winning_money'] - $data['net_betting_money'];
        $data['jackpot_money'] = $this->baseTransactionQuery($user)->jackpot()->sum('money');
        $data['bonus_money'] = $this->baseTransactionQuery($user)->bonus()->sum('money');
        $data['promo_win_money'] = $this->baseTransactionQuery($user)->promoWin()->sum('money');

        return $data;
    }

    public function getCumulativeDailySettlementsArray(?User $user = null)
    {
        $data['approved_members_count'] = $this->baseDailySettlementQuery($user)->sum('approved_members_count');
        $data['requested_members_count'] = $this->baseDailySettlementQuery($user)->sum('requested_members_count');
        $data['deposited_money'] = $this->baseDailySettlementQuery($user)->sum('deposited_money');
        $data['deposited_money_count'] = $this->baseDailySettlementQuery($user)->sum('deposited_money_count');
        $data['deposited_money_by_admin'] = $this->baseDailySettlementQuery($user)->sum('deposited_money_by_admin');
        $data['deposited_money_by_admin_count'] = $this->baseDailySettlementQuery($user)->sum('deposited_money_by_admin_count');
        $data['withdrawal_money'] = $this->baseDailySettlementQuery($user)->sum('withdrawal_money');
        $data['withdrawal_money_count'] = $this->baseDailySettlementQuery($user)->sum('withdrawal_money_count');
        $data['withdrawal_money_by_admin'] = $this->baseDailySettlementQuery($user)->sum('withdrawal_money_by_admin');
        $data['withdrawal_money_by_admin_count'] = $this->baseDailySettlementQuery($user)->sum('withdrawal_money_by_admin_count');
        $data['points'] = $this->baseDailySettlementQuery($user)->sum('points');
        $data['points_credited_by_admin'] = $this->baseDailySettlementQuery($user)->sum('points_credited_by_admin');
        $data['points_credited_by_admin_count'] = $this->baseDailySettlementQuery($user)->sum('points_credited_by_admin_count');
        $data['points_credited_by_referal_code'] = $this->baseDailySettlementQuery($user)->sum('points_credited_by_referal_code');
        $data['points_credited_by_referal_code_count'] = $this->baseDailySettlementQuery($user)->sum('points_credited_by_referal_code_count');
        $data['points_credited_by_losing_bet'] = $this->baseDailySettlementQuery($user)->sum('points_credited_by_losing_bet');
        $data['points_credited_by_losing_bet_count'] = $this->baseDailySettlementQuery($user)->sum('points_credited_by_losing_bet_count');
        $data['promotion_points'] = $this->baseDailySettlementQuery($user)->sum('promotion_points');
        $data['promotion_points_count'] = $this->baseDailySettlementQuery($user)->sum('promotion_points_count');
        $data['points_debited_by_admin'] = $this->baseDailySettlementQuery($user)->sum('points_debited_by_admin');
        $data['points_debited_by_admin_count'] = $this->baseDailySettlementQuery($user)->sum('points_debited_by_admin_count');
        $data['points_exchange'] = $this->baseDailySettlementQuery($user)->sum('points_exchange');
        $data['points_exchange_count'] = $this->baseDailySettlementQuery($user)->sum('points_exchange_count');
        $data['coupon_points'] = $this->baseDailySettlementQuery($user)->sum('coupon_points');
        $data['coupon_points_credited_by_admin'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_credited_by_admin');
        $data['coupon_points_credited_by_admin_count'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_credited_by_admin_count');
        $data['coupon_points_debited_by_admin'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_debited_by_admin');
        $data['coupon_points_debited_by_admin_count'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_debited_by_admin_count');
        $data['coupon_points_credited_by_agent'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_credited_by_agent');
        $data['coupon_points_credited_by_agent_count'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_credited_by_agent_count');
        $data['coupon_points_debited_by_agent'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_debited_by_agent');
        $data['coupon_points_debited_by_agent_count'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_debited_by_agent_count');
        $data['coupon_points_distribution_payment_by_agent'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_distribution_payment_by_agent');
        $data['coupon_points_distribution_payment_by_agent_count'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_distribution_payment_by_agent_count');
        $data['coupon_points_distribution_recovery_by_agent'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_distribution_recovery_by_agent');
        $data['coupon_points_distribution_recovery_by_agent_count'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_distribution_recovery_by_agent_count');
        $data['coupon_points_exchange'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_exchange');
        $data['coupon_points_exchange_count'] = $this->baseDailySettlementQuery($user)->sum('coupon_points_exchange_count');
        $data['holding_money'] = $this->baseDailySettlementQuery($user)->sum('holding_money');
        $data['total_holding_money'] = $this->baseDailySettlementQuery($user)->sum('total_holding_money');
        $data['total_points'] = $this->baseDailySettlementQuery($user)->sum('total_points');
        $data['total_coupon_points'] = $this->baseDailySettlementQuery($user)->sum('total_coupon_points');
        $data['total_losing_money'] = $this->baseDailySettlementQuery($user)->sum('total_losing_money');
        $data['total_rolling_money'] = $this->baseDailySettlementQuery($user)->sum('total_rolling_money');
        $data['total_betting_money'] = $this->baseDailySettlementQuery($user)->sum('total_betting_money');
        $data['total_betting_amount_slot'] = $this->baseDailySettlementQuery($user)->sum('total_betting_amount_slot');
        $data['total_betting_amount_casino'] = $this->baseDailySettlementQuery($user)->sum('total_betting_amount_casino');
        $data['total_refunded_money'] = $this->baseDailySettlementQuery($user)->sum('total_refunded_money');
        $data['total_refunded_amount_slot'] = $this->baseDailySettlementQuery($user)->sum('total_refunded_amount_slot');
        $data['total_refunded_amount_casino'] = $this->baseDailySettlementQuery($user)->sum('total_refunded_amount_casino');
        $data['total_net_betting_money'] = $this->baseDailySettlementQuery($user)->sum('total_net_betting_money');
        $data['total_net_betting_amount_slot'] = $this->baseDailySettlementQuery($user)->sum('total_net_betting_amount_slot');
        $data['total_net_betting_amount_casino'] = $this->baseDailySettlementQuery($user)->sum('total_net_betting_amount_casino');
        $data['total_winning_money'] = $this->baseDailySettlementQuery($user)->sum('total_winning_money');
        $data['total_winning_amount_slot'] = $this->baseDailySettlementQuery($user)->sum('total_winning_amount_slot');
        $data['total_winning_amount_casino'] = $this->baseDailySettlementQuery($user)->sum('total_winning_amount_casino');
        $data['total_canceled_money'] = $this->baseDailySettlementQuery($user)->sum('total_canceled_money');
        $data['total_canceled_amount_slot'] = $this->baseDailySettlementQuery($user)->sum('total_canceled_amount_slot');
        $data['total_canceled_amount_casino'] = $this->baseDailySettlementQuery($user)->sum('total_canceled_amount_casino');
        $data['total_net_winning_money'] = $this->baseDailySettlementQuery($user)->sum('total_net_winning_money');
        $data['total_net_winning_amount_slot'] = $this->baseDailySettlementQuery($user)->sum('total_net_winning_amount_slot');
        $data['total_net_winning_amount_casino'] = $this->baseDailySettlementQuery($user)->sum('total_net_winning_amount_casino');
        $data['total_betting_difference'] = $this->baseDailySettlementQuery($user)->sum('total_betting_difference');
        $data['total_betting_difference_slot'] = $this->baseDailySettlementQuery($user)->sum('total_betting_difference_slot');
        $data['total_betting_difference_casino'] = $this->baseDailySettlementQuery($user)->sum('total_betting_difference_casino');
        $data['total_net_betting_difference'] = $this->baseDailySettlementQuery($user)->sum('total_net_betting_difference');
        $data['total_net_betting_difference_slot'] = $this->baseDailySettlementQuery($user)->sum('total_net_betting_difference_slot');
        $data['total_net_betting_difference_casino'] = $this->baseDailySettlementQuery($user)->sum('total_net_betting_difference_casino');
        $data['total_jackpot_money'] = $this->baseDailySettlementQuery($user)->sum('total_jackpot_money');
        $data['total_bonus_money'] = $this->baseDailySettlementQuery($user)->sum('total_bonus_money');
        $data['total_promo_win_money'] = $this->baseDailySettlementQuery($user)->sum('total_promo_win_money');
        $data['first_recharge_bonus_points_after_signup'] = $this->baseDailySettlementQuery($user)->sum('first_recharge_bonus_points_after_signup');
        $data['first_recharge_bonus_points_after_signup_count'] = $this->baseDailySettlementQuery($user)->sum('first_recharge_bonus_points_after_signup_count');
        $data['first_recharge_bonus_points_of_day'] = $this->baseDailySettlementQuery($user)->sum('first_recharge_bonus_points_of_day');
        $data['first_recharge_bonus_points_of_day_count'] = $this->baseDailySettlementQuery($user)->sum('first_recharge_bonus_points_of_day_count');
        $data['per_recharge_bonus_points'] = $this->baseDailySettlementQuery($user)->sum('per_recharge_bonus_points');
        $data['per_recharge_bonus_points_count'] = $this->baseDailySettlementQuery($user)->sum('per_recharge_bonus_points_count');
        $data['rolling_money'] = $this->baseDailySettlementQuery($user)->sum('rolling_money');
        $data['rolling_money_credited'] = $this->baseDailySettlementQuery($user)->sum('rolling_money_credited');
        $data['rolling_money_credited_count'] = $this->baseDailySettlementQuery($user)->sum('rolling_money_credited_count');
        $data['rolling_money_withdrawal'] = $this->baseDailySettlementQuery($user)->sum('rolling_money_withdrawal');
        $data['rolling_money_withdrawal_count'] = $this->baseDailySettlementQuery($user)->sum('rolling_money_withdrawal_count');
        $data['losing_money'] = $this->baseDailySettlementQuery($user)->sum('losing_money');
        $data['losing_money_credited'] = $this->baseDailySettlementQuery($user)->sum('losing_money_credited');
        $data['losing_money_credited_count'] = $this->baseDailySettlementQuery($user)->sum('losing_money_credited_count');
        $data['losing_money_debited'] = $this->baseDailySettlementQuery($user)->sum('losing_money_debited');
        $data['losing_money_debited_count'] = $this->baseDailySettlementQuery($user)->sum('losing_money_debited_count');
        $data['losing_money_withdrawal'] = $this->baseDailySettlementQuery($user)->sum('losing_money_withdrawal');
        $data['losing_money_withdrawal_count'] = $this->baseDailySettlementQuery($user)->sum('losing_money_withdrawal_count');
        $data['betting_money'] = $this->baseDailySettlementQuery($user)->sum('betting_money');
        $data['refunded_money'] = $this->baseDailySettlementQuery($user)->sum('refunded_money');
        $data['net_betting_money'] = $this->baseDailySettlementQuery($user)->sum('net_betting_money');
        $data['winning_money'] = $this->baseDailySettlementQuery($user)->sum('winning_money');
        $data['canceled_money'] = $this->baseDailySettlementQuery($user)->sum('canceled_money');
        $data['net_winning_money'] = $this->baseDailySettlementQuery($user)->sum('net_winning_money');
        $data['betting_difference'] = $this->baseDailySettlementQuery($user)->sum('betting_difference');
        $data['net_betting_difference'] = $this->baseDailySettlementQuery($user)->sum('net_betting_difference');
        $data['jackpot_money'] = $this->baseDailySettlementQuery($user)->sum('jackpot_money');
        $data['bonus_money'] = $this->baseDailySettlementQuery($user)->sum('bonus_money');
        $data['promo_win_money'] = $this->baseDailySettlementQuery($user)->sum('promo_win_money');

        return $data;
    }

    public function getMonthlySettlementArray(DailyCumulativeSettlement|UserDailyCumulativeSettlement $settlement, ?User $user = null)
    {
        $data['approved_members_count'] = $settlement->approved_members_count;
        $data['requested_members_count'] = $settlement->requested_members_count;
        $data['deposited_money'] = $settlement->deposited_money;
        $data['deposited_money_count'] = $settlement->deposited_money_count;
        $data['deposited_money_by_admin'] = $settlement->deposited_money_by_admin;
        $data['deposited_money_by_admin_count'] = $settlement->deposited_money_by_admin_count;
        $data['withdrawal_money'] = $settlement->withdrawal_money;
        $data['withdrawal_money_count'] = $settlement->withdrawal_money_count;
        $data['withdrawal_money_by_admin'] = $settlement->withdrawal_money_by_admin;
        $data['withdrawal_money_by_admin_count'] = $settlement->withdrawal_money_by_admin_count;
        $data['points'] = $settlement->points;
        $data['points_credited_by_admin'] = $settlement->points_credited_by_admin;
        $data['points_credited_by_admin_count'] = $settlement->points_credited_by_admin_count;
        $data['points_credited_by_referal_code'] = $settlement->points_credited_by_referal_code;
        $data['points_credited_by_referal_code_count'] = $settlement->points_credited_by_referal_code_count;
        $data['points_credited_by_losing_bet'] = $settlement->points_credited_by_losing_bet;
        $data['points_credited_by_losing_bet_count'] = $settlement->points_credited_by_losing_bet_count;
        $data['promotion_points'] = $settlement->promotion_points;
        $data['promotion_points_count'] = $settlement->promotion_points_count;
        $data['points_debited_by_admin'] = $settlement->points_debited_by_admin;
        $data['points_debited_by_admin_count'] = $settlement->points_debited_by_admin_count;
        $data['points_exchange'] = $settlement->points_exchange;
        $data['points_exchange_count'] = $settlement->points_exchange_count;
        $data['coupon_points'] = $settlement->coupon_points;
        $data['coupon_points_credited_by_admin'] = $settlement->coupon_points_credited_by_admin;
        $data['coupon_points_credited_by_admin_count'] = $settlement->coupon_points_credited_by_admin_count;
        $data['coupon_points_debited_by_admin'] = $settlement->coupon_points_debited_by_admin;
        $data['coupon_points_debited_by_admin_count'] = $settlement->coupon_points_debited_by_admin_count;
        $data['coupon_points_credited_by_agent'] = $settlement->coupon_points_credited_by_agent;
        $data['coupon_points_credited_by_agent_count'] = $settlement->coupon_points_credited_by_agent_count;
        $data['coupon_points_debited_by_agent'] = $settlement->coupon_points_debited_by_agent;
        $data['coupon_points_debited_by_agent_count'] = $settlement->coupon_points_debited_by_agent_count;
        $data['coupon_points_distribution_payment_by_agent'] = $settlement->coupon_points_distribution_payment_by_agent;
        $data['coupon_points_distribution_payment_by_agent_count'] = $settlement->coupon_points_distribution_payment_by_agent_count;
        $data['coupon_points_distribution_recovery_by_agent'] = $settlement->coupon_points_distribution_recovery_by_agent;
        $data['coupon_points_distribution_recovery_by_agent_count'] = $settlement->coupon_points_distribution_recovery_by_agent_count;
        $data['coupon_points_exchange'] = $settlement->coupon_points_exchange;
        $data['coupon_points_exchange_count'] = $settlement->coupon_points_exchange_count;
        $data['holding_money'] = $settlement->holding_money;
        $data['total_holding_money'] = $settlement->total_holding_money;
        $data['total_points'] = $settlement->total_points;
        $data['total_coupon_points'] = $settlement->total_coupon_points;
        $data['total_losing_money'] = $settlement->total_losing_money;
        $data['total_rolling_money'] = $settlement->total_rolling_money;
        $data['total_betting_money'] = $settlement->total_betting_money;
        $data['total_betting_amount_slot'] = $settlement->total_betting_amount_slot;
        $data['total_betting_amount_casino'] = $settlement->total_betting_amount_casino;
        $data['total_refunded_money'] = $settlement->total_refunded_money;
        $data['total_refunded_amount_slot'] = $settlement->total_refunded_amount_slot;
        $data['total_refunded_amount_casino'] = $settlement->total_refunded_amount_casino;
        $data['total_net_betting_money'] = $settlement->total_net_betting_money;
        $data['total_net_betting_amount_slot'] = $settlement->total_net_betting_amount_slot;
        $data['total_net_betting_amount_casino'] = $settlement->total_net_betting_amount_casino;
        $data['total_winning_money'] = $settlement->total_winning_money;
        $data['total_winning_amount_slot'] = $settlement->total_winning_amount_slot;
        $data['total_winning_amount_casino'] = $settlement->total_winning_amount_casino;
        $data['total_canceled_money'] = $settlement->total_canceled_money;
        $data['total_canceled_amount_slot'] = $settlement->total_canceled_amount_slot;
        $data['total_canceled_amount_casino'] = $settlement->total_canceled_amount_casino;
        $data['total_net_winning_money'] = $settlement->total_net_winning_money;
        $data['total_net_winning_amount_slot'] = $settlement->total_net_winning_amount_slot;
        $data['total_net_winning_amount_casino'] = $settlement->total_net_winning_amount_casino;
        $data['total_betting_difference'] = $settlement->total_betting_difference;
        $data['total_betting_difference_slot'] = $settlement->total_betting_difference_slot;
        $data['total_betting_difference_casino'] = $settlement->total_betting_difference_casino;
        $data['total_net_betting_difference'] = $settlement->total_net_betting_difference;
        $data['total_net_betting_difference_slot'] = $settlement->total_net_betting_difference_slot;
        $data['total_net_betting_difference_casino'] = $settlement->total_net_betting_difference_casino;
        $data['total_jackpot_money'] = $settlement->total_jackpot_money;
        $data['total_bonus_money'] = $settlement->total_bonus_money;
        $data['total_promo_win_money'] = $settlement->total_promo_win_money;
        $data['first_recharge_bonus_points_after_signup'] = $settlement->first_recharge_bonus_points_after_signup;
        $data['first_recharge_bonus_points_after_signup_count'] = $settlement->first_recharge_bonus_points_after_signup_count;
        $data['first_recharge_bonus_points_of_day'] = $settlement->first_recharge_bonus_points_of_day;
        $data['first_recharge_bonus_points_of_day_count'] = $settlement->first_recharge_bonus_points_of_day_count;
        $data['per_recharge_bonus_points'] = $settlement->per_recharge_bonus_points;
        $data['per_recharge_bonus_points_count'] = $settlement->per_recharge_bonus_points_count;
        $data['rolling_money'] = $settlement->rolling_money;
        $data['rolling_money_credited'] = $settlement->rolling_money_credited;
        $data['rolling_money_credited_count'] = $settlement->rolling_money_credited_count;
        $data['rolling_money_withdrawal'] = $settlement->rolling_money_withdrawal;
        $data['rolling_money_withdrawal_count'] = $settlement->rolling_money_withdrawal_count;
        $data['losing_money'] = $settlement->losing_money;
        $data['losing_money_credited'] = $settlement->losing_money_credited;
        $data['losing_money_credited_count'] = $settlement->losing_money_credited_count;
        $data['losing_money_debited'] = $settlement->losing_money_debited;
        $data['losing_money_debited_count'] = $settlement->losing_money_debited_count;
        $data['losing_money_withdrawal'] = $settlement->losing_money_withdrawal;
        $data['losing_money_withdrawal_count'] = $settlement->losing_money_withdrawal_count;
        $data['betting_money'] = $settlement->betting_money;
        $data['refunded_money'] = $settlement->refunded_money;
        $data['net_betting_money'] = $settlement->net_betting_money;
        $data['winning_money'] = $settlement->winning_money;
        $data['canceled_money'] = $settlement->canceled_money;
        $data['net_winning_money'] = $settlement->net_winning_money;
        $data['betting_difference'] = $settlement->betting_difference;
        $data['net_betting_difference'] = $settlement->net_betting_difference;
        $data['jackpot_money'] = $settlement->jackpot_money;
        $data['bonus_money'] = $settlement->bonus_money;
        $data['promo_win_money'] = $settlement->promo_win_money;

        return $data;
    }
}
