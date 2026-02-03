<?php

namespace App\Utils\Traits\Model;

use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Models\ExchangeRequest;
use App\Models\User;
use App\Utils\Services\Utils;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

trait TransactionTrait
{
    public static function generateTransactionNumber()
    {
        $transactionNumber = 'trx_'.date('YmdHis').rand(1000, 9999);

        while (self::where('transaction_number', $transactionNumber)->exists()) {
            $transactionNumber = 'trx_'.date('YmdHis').rand(1000, 9999);
        }

        return $transactionNumber;
    }

    private static function processMoneyTransaction(
        ?self $transaction,
        User $user,
        float $amount,
    ): self {
        if (in_array($transaction->type, [
            TransactionTypeEnum::DEPOSIT,
            TransactionTypeEnum::MONEY_CREDITED,
        ])) {
            $transaction->money = $amount;
            $transaction->after_money = $user->wallet->holding_money + $amount;
        }

        if (in_array($transaction->type, [
            TransactionTypeEnum::WITHDRAW,
            TransactionTypeEnum::MONEY_DEBITED,
        ])) {
            if ($amount > $user->wallet->holding_money) {
                throw new Exception('not_enough_balance_to_withdraw');
            }
            $transaction->money = $amount;
            $transaction->after_money = $user->wallet->holding_money - $amount;
        }

        return $transaction;
    }

    private static function processPointsTransaction(
        ?self $transaction,
        User $user,
        float $amount,
        ?ExchangeRequest $exchangeRequest = null,
    ): self {
        if ($exchangeRequest && $exchangeRequest->type === TransactionTypeEnum::POINTS_EXCHANGE) {
            if ($amount > $user->wallet->points) {
                throw new Exception('not_enough_points_to_exchange');
            }
            $transaction->before_money = $user->wallet->points;
            $transaction->money = $amount;
            $transaction->after_money = $transaction->before_money - $transaction->money;
            $transaction->category = TransactionCategoryEnum::CONVERTED_POINTS_TO_MONEY;
        }

        if ($transaction->type === TransactionTypeEnum::POINTS_CREDITED) {
            $transaction->before_money = $user->wallet->points;
            $transaction->money = $amount;
            $transaction->after_money = $transaction->before_money + $transaction->money;
        }

        if ($transaction->type === TransactionTypeEnum::POINTS_DEBITED) {
            if ($amount > $user->wallet->points) {
                throw new Exception('not_enough_points_to_withdraw');
            }
            $transaction->before_money = $user->wallet->points;
            $transaction->money = $amount;
            $transaction->after_money = $transaction->before_money - $transaction->money;
        }

        return $transaction;
    }

    private static function processCouponPointsTransaction(
        ?self $transaction,
        User $user,
        float $amount,
        ?ExchangeRequest $exchangeRequest = null,
    ): self {
        if ($exchangeRequest && $exchangeRequest->type === TransactionTypeEnum::COUPON_POINTS_EXCHANGE) {
            if ($amount > $user->wallet->coupon_points) {
                throw new Exception('not_enough_coupon_points_to_exchange');
            }
            $transaction->before_money = $user->wallet->coupon_points;
            $transaction->money = $amount;
            $transaction->after_money = $transaction->before_money - $transaction->money;
            $transaction->category = TransactionCategoryEnum::CONVERTED_COUPON_POINTS_TO_MONEY;
        }

        if (in_array($transaction->type, [
            TransactionTypeEnum::COUPON_POINTS_CREDITED,
        ])) {
            $transaction->before_money = $user->wallet->coupon_points;
            $transaction->money = $amount;
            $transaction->after_money = $transaction->before_money + $transaction->money;
        }

        if (in_array($transaction->type, [
            TransactionTypeEnum::COUPON_POINTS_DEBITED,
        ])) {
            if ($amount > $user->wallet->coupon_points) {
                throw new Exception('not_enough_coupon_points_to_withdraw');
            }
            $transaction->before_money = $user->wallet->coupon_points;
            $transaction->money = $amount;
            $transaction->after_money = $transaction->before_money - $transaction->money;
        }

        return $transaction;
    }

    private static function processRollingMoneyTransaction(
        ?self $transaction,
        User $user,
        float $amount,
    ): self {
        if (in_array($transaction->type, [
            TransactionTypeEnum::ROLLING_MONEY_CREDITED,
        ])) {
            $transaction->money = $amount;
            $transaction->after_money = $user->wallet->rolling_money + $amount;
        }

        if (in_array($transaction->type, [
            TransactionTypeEnum::WITHDRAW_ROLLING_MONEY,
        ])) {
            if ($amount > $user->wallet->rolling_money) {
                throw new Exception('not_enough_balance_to_withdraw');
            }
            $transaction->money = $amount;
            $transaction->after_money = $user->wallet->rolling_money - $amount;
        }

        return $transaction;
    }

    private static function processLosingMoneyTransaction(
        ?self $transaction,
        User $user,
        float $amount,
    ): self {
        if (in_array($transaction->type, [
            TransactionTypeEnum::LOSING_MONEY_CREDITED,
        ])) {
            $transaction->money = $amount;
            $transaction->after_money = $user->wallet->losing_money + $amount;
        }
        if (in_array($transaction->type, [
            TransactionTypeEnum::LOSING_MONEY_DEBITED,
        ])) {
            $transaction->money = $amount;
            $transaction->after_money = $user->wallet->losing_money - $amount;
        }

        if (in_array($transaction->type, [
            TransactionTypeEnum::WITHDRAW_LOSING_MONEY,
        ])) {
            if ($amount > $user->wallet->losing_money) {
                throw new Exception('not_enough_balance_to_withdraw');
            }
            $transaction->money = $amount;
            $transaction->after_money = $user->wallet->losing_money - $amount;
        }

        return $transaction;
    }

    public static function createTransaction(
        TransactionTypeEnum $type,
        float $amount,
        MoneyTypeEnum $moneyType,
        User $user,
        ?ExchangeRequest $exchangeRequest = null,
        ?TransactionSourceEnum $source = null,
        ?TransactionCategoryEnum $category = null,
        ?string $memo = null,
        ?string $txnId = null,
        ?int $debitReferenceTransactionId = null,
        ?int $creditReferenceTransactionId = null,
        ?int $gameSessionId = null,
        ?int $gameId = null,
        ?int $companyId = null,
        ?int $providerId = null,
        ?string $companyGameId = null,
        ?string $companyRoundId = null,
        ?string $companyJackpotId = null,
        ?string $companyCampaignId = null,
        ?string $companyCampaignType = null,
        ?array $companyRequestBody = null,
        ?int $givenTo = null,
        ?int $givenBy = null,
        ?Carbon $createdAt = null,
        ?string $referenceNumber = null,
        ?int $sourceTransactionId = null,
    ) {
        DB::beginTransaction();
        try {
            $transaction = new self;
            $transaction->user_id = $user->id;
            $transaction->transaction_number = self::generateTransactionNumber();
            $transaction->user_wallet_id = $user->wallet->id;
            $transaction->exchange_request_id = $exchangeRequest ? $exchangeRequest->id : null;
            $transaction->type = $type;
            $transaction->sub_type = $moneyType;
            $transaction->source = $exchangeRequest ? TransactionSourceEnum::EXCHANGE_REQUEST : ($source ?: TransactionSourceEnum::GAME);
            $transaction->category = $category;
            $transaction->memo = $memo;
            $transaction->txn_id = $txnId;
            $transaction->game_id = $gameId;
            $transaction->company_id = $companyId;
            $transaction->provider_id = $providerId;
            $transaction->reference_debit_transaction_id = $debitReferenceTransactionId;
            $transaction->reference_credit_transaction_id = $creditReferenceTransactionId;
            $transaction->source_transaction_id = $sourceTransactionId;
            $transaction->user_game_session_id = $gameSessionId;
            $transaction->company_game_id = $companyGameId;
            $transaction->company_round_id = $companyRoundId;
            $transaction->company_jackpot_id = $companyJackpotId;
            $transaction->company_campaign_id = $companyCampaignId;
            $transaction->company_campaign_type = $companyCampaignType;
            $transaction->given_to = $givenTo;
            if ($givenBy) {
                $transaction->created_by = $givenBy;
            }
            if ($companyRequestBody) {
                $transaction->company_request_body = $companyRequestBody;
            }

            if ($moneyType === MoneyTypeEnum::MONEY) {
                $transaction->before_money = $user->wallet->holding_money;
                $transaction = self::processMoneyTransaction($transaction, $user, $amount);
            }

            if ($moneyType === MoneyTypeEnum::POINTS) {
                $transaction->before_money = $user->wallet->points;
                $transaction = self::processPointsTransaction($transaction, $user, $amount, $exchangeRequest);
            }

            if ($moneyType === MoneyTypeEnum::COUPON_POINTS) {
                $transaction->before_money = $user->wallet->coupon_points;
                $transaction = self::processCouponPointsTransaction($transaction, $user, $amount, $exchangeRequest);
            }

            if ($moneyType === MoneyTypeEnum::ROLLING_MONEY) {
                $transaction->before_money = $user->wallet->rolling_money;
                $transaction = self::processRollingMoneyTransaction($transaction, $user, $amount, $exchangeRequest);
            }

            if ($moneyType === MoneyTypeEnum::LOSING_MONEY) {
                $transaction->before_money = $user->wallet->losing_money;
                $transaction = self::processLosingMoneyTransaction($transaction, $user, $amount, $exchangeRequest);
            }

            if ($createdAt) {
                $transaction->created_at = $createdAt;
            }

            if ($referenceNumber) {
                $transaction->reference_number = $referenceNumber;
            }

            $transaction->save();

            $user->wallet->updateWallet($transaction);

            $transaction->processBonus();

            DB::commit();

            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function createAffectedTransaction()
    {
        if (in_array($this->category, [
            TransactionCategoryEnum::CONVERTED_POINTS_TO_MONEY,
            TransactionCategoryEnum::CONVERTED_COUPON_POINTS_TO_MONEY,
        ])) {
            return $this->replicateQuietly()->fill([
                'source_transaction_id' => $this->id,
                'type' => TransactionTypeEnum::MONEY_CREDITED,
                'sub_type' => MoneyTypeEnum::MONEY,
                'before_money' => $this->user->wallet->holding_money - Utils::calculateMoneyAgainstPoints($this->money),
                'after_money' => $this->user->wallet->holding_money,
                'money' => Utils::calculateMoneyAgainstPoints($this->money),
                'transaction_number' => self::generateTransactionNumber(),
            ])->save();
        }

        return false;
    }

    public function processBonus(): ?self
    {
        $config = $this->user->levelConfig();
        if ($config && $this->type === TransactionTypeEnum::DEPOSIT) {
            $money = $this->money;

            $isFirstTransactionAfterSignup = self::where('id', '!=', $this->id)->whereBelongsTo($this->user)->whereType(TransactionTypeEnum::DEPOSIT)->doesntExist();

            if ($isFirstTransactionAfterSignup) {
                if (! $this->user->is_new_signup_first_recharge_bonus_enabled) {
                    return null;
                }
                $commission = $config->getCommission($money, 'new_signup_first_recharge_bonus');

                if ($commission > 0) {
                    return self::createTransaction(
                        type: TransactionTypeEnum::POINTS_CREDITED,
                        amount: $commission,
                        moneyType: MoneyTypeEnum::POINTS,
                        user: $this->user,
                        source: TransactionSourceEnum::DEPOSIT_BONUS,
                        category: TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_AFTER_SIGNUP,
                    );
                }

                return null;
            }

            $isFirstTransactionOfDay = self::where('id', '!=', $this->id)->whereBelongsTo($this->user)->whereType(TransactionTypeEnum::DEPOSIT)->whereDate('created_at', today())->doesntExist();

            if ($isFirstTransactionOfDay) {
                if (! $this->user->is_first_recharge_bonus_of_day_enabled) {
                    return null;
                }
                $commission = $config->getCommission($money, 'first_recharge_bonus_of_day');

                if ($commission > 0) {
                    return self::createTransaction(
                        type: TransactionTypeEnum::POINTS_CREDITED,
                        amount: $commission,
                        moneyType: MoneyTypeEnum::POINTS,
                        user: $this->user,
                        source: TransactionSourceEnum::DEPOSIT_BONUS,
                        category: TransactionCategoryEnum::FIRST_RECHARGE_BONUS_POINTS_OF_DAY,
                    );
                }

                return null;
            }

            if (! $this->user->is_bonus_per_recharge_enabled) {
                return null;
            }
            $commission = $config->getCommission($money, 'bonus_per_recharge');

            if ($commission > 0) {
                return self::createTransaction(
                    type: TransactionTypeEnum::POINTS_CREDITED,
                    amount: $commission,
                    moneyType: MoneyTypeEnum::POINTS,
                    user: $this->user,
                    source: TransactionSourceEnum::DEPOSIT_BONUS,
                    category: TransactionCategoryEnum::PER_RECHARGE_BONUS_POINTS,
                );
            }
        }

        return null;
    }

    public function isBet()
    {
        return $this->type === TransactionTypeEnum::MONEY_DEBITED && $this->category === TransactionCategoryEnum::GAME_BET_MONEY;
    }

    public function isWin()
    {
        return $this->type === TransactionTypeEnum::MONEY_CREDITED && $this->category === TransactionCategoryEnum::GAME_BET_WIN_MONEY;
    }

    public function isRefund()
    {
        return $this->type === TransactionTypeEnum::MONEY_CREDITED && $this->category === TransactionCategoryEnum::GAME_REFUNDED_MONEY;
    }

    public function isCancel()
    {
        return $this->type === TransactionTypeEnum::MONEY_DEBITED && $this->category === TransactionCategoryEnum::GAME_CANCELED_MONEY;
    }

    public function isJackpot()
    {
        return $this->type === TransactionTypeEnum::MONEY_CREDITED && $this->category === TransactionCategoryEnum::GAME_JACKPOT_MONEY;
    }

    public function isBonus()
    {
        return $this->type === TransactionTypeEnum::MONEY_CREDITED && $this->category === TransactionCategoryEnum::GAME_BONUS_MONEY;
    }

    public function isPromoWin()
    {
        return $this->type === TransactionTypeEnum::MONEY_CREDITED && $this->category === TransactionCategoryEnum::GAME_PROMO_WIN_MONEY;
    }

    public function isActive()
    {
        return empty($this->canceled_at) && empty($this->refunded_at) && empty($this->round_ended_at) && empty($this->rolled_back_at);
    }
}
