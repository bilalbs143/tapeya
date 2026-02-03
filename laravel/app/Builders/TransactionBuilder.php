<?php

namespace App\Builders;

use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use Illuminate\Database\Eloquent\Builder;

class TransactionBuilder extends Builder
{
    public function active()
    {
        $this->whereNull('canceled_at')->whereNull('refunded_at')->whereNull('round_ended_at')->whereNull('rolled_back_at');

        return $this;
    }

    public function deposited()
    {
        $this->whereType(TransactionTypeEnum::DEPOSIT);

        return $this;
    }

    public function depositedByAdmin()
    {
        $this->whereType(TransactionTypeEnum::MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::ADMINISTRATOR_MANUAL_PAYMENT);

        return $this;
    }

    public function withdrawal()
    {
        $this->whereType(TransactionTypeEnum::WITHDRAW);

        return $this;
    }

    public function withdrawalByAdmin()
    {
        $this->whereType(TransactionTypeEnum::MONEY_DEBITED)->whereCategory(TransactionCategoryEnum::ADMINISTRATOR_MANUAL_RECOVERY);

        return $this;
    }

    public function pointsExchanged()
    {
        $this->whereType(TransactionTypeEnum::POINTS_EXCHANGE);

        return $this;
    }

    public function pointsCreditedByAdmin()
    {
        $this->whereType(TransactionTypeEnum::POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_PAYMENT);

        return $this;
    }

    public function pointsCreditedByReferalCode()
    {
        $this->whereType(TransactionTypeEnum::POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::REFFERAL_BONUS_POINTS);

        return $this;
    }

    public function pointsCreditedByLosingBet()
    {
        $this->whereType(TransactionTypeEnum::POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::WEEKLY_LOSS_BONUS);

        return $this;
    }

    public function promotionPointsCredited()
    {
        $this->whereType(TransactionTypeEnum::POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::PROMOTION_POINTS);

        return $this;
    }

    public function promotionPointsDebited()
    {
        $this->whereType(TransactionTypeEnum::POINTS_DEBITED)->whereCategory(TransactionCategoryEnum::PROMOTION_POINTS);

        return $this;
    }

    public function pointsDebitedByAdmin()
    {
        $this->whereType(TransactionTypeEnum::POINTS_DEBITED)->whereCategory(TransactionCategoryEnum::ADMINISTRATOR_MANUAL_POINTS_RECOVERY);

        return $this;
    }

    public function couponPointsExchanged()
    {
        $this->whereType(TransactionTypeEnum::COUPON_POINTS_EXCHANGE);

        return $this;
    }

    public function couponPointsCreditedByAdmin()
    {
        $this->whereType(TransactionTypeEnum::COUPON_POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_PAYMENT);

        return $this;
    }

    public function couponPointsDebitedByAdmin()
    {
        $this->whereType(TransactionTypeEnum::COUPON_POINTS_DEBITED)->whereCategory(TransactionCategoryEnum::ADMINISTRATOR_MANUAL_COUPON_POINTS_RECOVERY);

        return $this;
    }

    public function couponPointsCreditedByAgent()
    {
        $this->whereType(TransactionTypeEnum::COUPON_POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_PAYMENT);

        return $this;
    }

    public function couponPointsDebitedByAgent()
    {
        $this->whereType(TransactionTypeEnum::COUPON_POINTS_DEBITED)->whereCategory(TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_RECOVERY);

        return $this;
    }

    public function couponPointsDistributionPaymentByAgent()
    {
        $this->whereType(TransactionTypeEnum::COUPON_POINTS_DEBITED)->whereCategory(TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_PAYMENT);

        return $this;
    }

    public function couponPointsDistributionRecoveryByAgent()
    {
        $this->whereType(TransactionTypeEnum::COUPON_POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::AGENT_MANUAL_COUPON_POINTS_DISTRIBUTION_RECOVERY);

        return $this;
    }

    public function firstRechargeBonusPointsAfterSignup()
    {
        $this->whereType(TransactionTypeEnum::POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_AFTER_SIGNUP);

        return $this;
    }

    public function firstRechargeBonusPointsOfDay()
    {
        $this->whereType(TransactionTypeEnum::POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_OF_DAY);

        return $this;
    }

    public function perRechargeBonusPoints()
    {
        $this->whereType(TransactionTypeEnum::POINTS_CREDITED)->whereCategory(TransactionCategoryEnum::PER_RECHARGE_BONUS_POINTS);

        return $this;
    }

    public function rollingMoneyCredited()
    {
        $this->whereType(TransactionTypeEnum::ROLLING_MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::ROLLING_MONEY_DISTRIBUTED);

        return $this;
    }

    public function rollingMoneyWithdrawal()
    {
        $this->whereType(TransactionTypeEnum::WITHDRAW_ROLLING_MONEY)->whereCategory(TransactionCategoryEnum::ROLLING_MONEY_WITHDRAWAL);

        return $this;
    }

    public function losingMoneyCredited()
    {
        $this->whereType(TransactionTypeEnum::LOSING_MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::LOSING_MONEY_DISTRIBUTED);

        return $this;
    }

    public function losingMoneyDebited()
    {
        $this->whereType(TransactionTypeEnum::LOSING_MONEY_DEBITED)->whereCategory(TransactionCategoryEnum::LOSING_MONEY_DEBITED);

        return $this;
    }

    public function losingMoneyWithdrawal()
    {
        $this->whereType(TransactionTypeEnum::WITHDRAW_LOSING_MONEY)->whereCategory(TransactionCategoryEnum::LOSING_MONEY_WITHDRAWAL);

        return $this;
    }

    public function byTxnId(string $txnId)
    {
        $this->where('txn_id', $txnId);

        return $this;
    }

    public function byRoundId(string $roundId)
    {
        $this->where('company_round_id', $roundId);

        return $this;
    }

    public function byReferenceNumber(string $referenceNumber)
    {
        $this->where('reference_number', $referenceNumber);

        return $this;
    }

    public function bet()
    {
        $this->whereType(TransactionTypeEnum::MONEY_DEBITED)->whereCategory(TransactionCategoryEnum::GAME_BET_MONEY);

        return $this;
    }

    public function win()
    {
        $this->whereType(TransactionTypeEnum::MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::GAME_BET_WIN_MONEY);

        return $this;
    }

    public function refund()
    {
        $this->whereType(TransactionTypeEnum::MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::GAME_REFUNDED_MONEY);

        return $this;
    }

    public function cancel()
    {
        $this->whereType(TransactionTypeEnum::MONEY_DEBITED)->whereCategory(TransactionCategoryEnum::GAME_CANCELED_MONEY);

        return $this;
    }

    public function jackpot()
    {
        $this->whereType(TransactionTypeEnum::MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::GAME_JACKPOT_MONEY);

        return $this;
    }

    public function bonus()
    {
        $this->whereType(TransactionTypeEnum::MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::GAME_BONUS_MONEY);

        return $this;
    }

    public function promoWin()
    {
        $this->whereType(TransactionTypeEnum::MONEY_CREDITED)->whereCategory(TransactionCategoryEnum::GAME_PROMO_WIN_MONEY);

        return $this;
    }
}
