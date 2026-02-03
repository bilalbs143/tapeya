<?php

namespace App\Models;

use App\Enums\TransactionResult\TransactionResultState;
use App\Sorts\SortByRelation;
use App\Sorts\SortByUser;
use App\Sorts\SortByUserByBank;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;

class TransactionResult extends BaseModel
{
    protected $fillable = [
        'state',
        'user_id',
        'user_game_session_id',
        'game_id',
        'company_id',
        'provider_id',
        'debit_transaction_id',
        'credit_transaction_id',
        'refund_transaction_id',
        'cancel_transaction_id',
        'debit_amount',
        'before_debit',
        'after_debit',
        'credit_amount',
        'before_credit',
        'after_credit',
        'refund_amount',
        'before_refund',
        'after_refund',
        'cancel_amount',
        'before_cancel',
        'after_cancel',
        'closing_balance',
    ];

    public function casts()
    {
        return [
            'state' => TransactionResultState::class,
            'debit_amount' => 'float',
            'before_debit' => 'float',
            'after_debit' => 'float',
            'credit_amount' => 'float',
            'before_credit' => 'float',
            'after_credit' => 'float',
            'refund_amount' => 'float',
            'before_refund' => 'float',
            'after_refund' => 'float',
            'cancel_amount' => 'float',
            'before_cancel' => 'float',
            'after_cancel' => 'float',
            'closing_balance' => 'float',
        ];
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function debit_result_cards()
    {
        return $this->hasOne(GameResultCard::class, 'transaction_id', 'debit_transaction_id');
    }

    public function credit_result_cards()
    {
        return $this->hasOne(GameResultCard::class, 'transaction_id', 'credit_transaction_id');
    }

    public function debit_transaction()
    {
        return $this->belongsTo(Transaction::class, 'debit_transaction_id');
    }

    public function credit_transaction()
    {
        return $this->belongsTo(Transaction::class, 'credit_transaction_id');
    }

    public function refund_transaction()
    {
        return $this->belongsTo(Transaction::class, 'refund_transaction_id');
    }

    public function cancel_transaction()
    {
        return $this->belongsTo(Transaction::class, 'cancel_transaction_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    private static function createResult(
        ?Transaction $debitTransaction,
        TransactionResultState $state,
        array $extra = []
    ) {
        $data = [
            'state' => $state,
            'user_id' => $debitTransaction->user_id,
            'user_game_session_id' => $debitTransaction->user_game_session_id,
            'game_id' => $debitTransaction->game_id,
            'company_id' => $debitTransaction->company_id,
            'provider_id' => $debitTransaction->provider_id,
            ...$extra,
        ];

        $result = self::create($data);
        if ($debitTransaction) {
            $result->debit_transaction()->associate($debitTransaction);
        }
        $result->save();

        return $result;
    }

    private static function generateBet(
        Transaction $currentTransaction,
        ?Transaction $debitTransaction
    ) {
        $wallet = $currentTransaction->user?->wallet;

        return self::createResult(
            debitTransaction: $debitTransaction,
            state: TransactionResultState::getState($currentTransaction),
            extra: [
                'debit_amount' => $currentTransaction->money ?: 0,
                'before_debit' => $currentTransaction->before_money ?: 0,
                'after_debit' => $currentTransaction->after_money ?: 0,
                'closing_balance' => $wallet->holding_money ?: 0,
            ]
        );
    }

    private static function generateCreditResult(
        Transaction $currentTransaction,
        ?Transaction $debitTransaction
    ) {
        $existingResult = self::where('debit_transaction_id', $debitTransaction->id)->first();

        if ($existingResult) {
            $wallet = $currentTransaction->user?->wallet;

            $existingResult->state = TransactionResultState::getState($currentTransaction);
            $existingResult->credit_amount = $currentTransaction->money ?: 0;
            $existingResult->before_credit = $currentTransaction->before_money ?: 0;
            $existingResult->after_credit = $currentTransaction->after_money ?: 0;
            $existingResult->closing_balance = $wallet->holding_money ?: 0;
            $existingResult->credit_transaction()->associate($currentTransaction);
            $existingResult->save();
        }

        return $existingResult;
    }

    private static function generateRefundResult(
        Transaction $currentTransaction,
        ?Transaction $debitTransaction
    ) {
        $existingResult = self::where('debit_transaction_id', $debitTransaction->id)->first();

        if ($existingResult) {
            $wallet = $currentTransaction->user?->wallet;

            $existingResult->state = TransactionResultState::getState($currentTransaction);
            $existingResult->refund_amount = $currentTransaction->money ?: 0;
            $existingResult->before_refund = $currentTransaction->before_money ?: 0;
            $existingResult->after_refund = $currentTransaction->after_money ?: 0;
            $existingResult->closing_balance = $wallet->holding_money ?: 0;
            $existingResult->refund_transaction()->associate($currentTransaction);
            $existingResult->save();
        }

        return $existingResult;
    }

    private static function generateCancelResult(
        Transaction $currentTransaction,
        ?Transaction $creditTransaction
    ) {
        $existingResult = self::where('credit_transaction_id', $creditTransaction->id)->first();

        if ($existingResult) {
            $wallet = $currentTransaction->user?->wallet;

            $existingResult->state = TransactionResultState::getState($currentTransaction);
            $existingResult->cancel_amount = $currentTransaction->money ?: 0;
            $existingResult->before_cancel = $currentTransaction->before_money ?: 0;
            $existingResult->after_cancel = $currentTransaction->after_money ?: 0;
            $existingResult->closing_balance = $wallet->holding_money ?: 0;
            $existingResult->cancel_transaction()->associate($currentTransaction);
            $existingResult->save();
        }

        return $existingResult;
    }

    public static function generateResult(
        Transaction $currentTransaction,
        ?Transaction $debitTransaction = null,
        ?Transaction $creditTransaction = null,
    ) {
        if ($currentTransaction->isBet()) {
            return self::generateBet($currentTransaction, $debitTransaction);
        }

        if ($currentTransaction->isWin()) {
            return self::generateCreditResult($currentTransaction, $debitTransaction);
        }

        if ($currentTransaction->isRefund()) {
            return self::generateRefundResult($currentTransaction, $debitTransaction);
        }

        if ($currentTransaction->isCancel()) {
            return self::generateCancelResult($currentTransaction, $creditTransaction);
        }
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('state'),
            AllowedFilter::exact('game_id'),
            AllowedFilter::exact('company_id'),
            AllowedFilter::exact('provider_id'),
            ...self::getUserFilters(),
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'state',
            'created_at',
            'closing_balance',
            'before_debit',
            'refund_amount',
            'cancel_amount',
            'debit_amount',
            'credit_amount',
            AllowedSort::custom('user_id.username', new SortByUser),
            AllowedSort::custom('user_id.name', new SortByUser),
            AllowedSort::custom('user_id.account_holder', new SortByUserByBank),
            AllowedSort::custom('user_id.account_number', new SortByUserByBank),
            AllowedSort::custom('provider_id.name', new SortByRelation(Provider::class)),
            AllowedSort::custom('provider_id.key', new SortByRelation(Provider::class)),
            AllowedSort::custom('game_id.sub_provider', new SortByRelation(Game::class)),
            AllowedSort::custom('game_id.name', new SortByRelation(Game::class)),
            AllowedSort::custom('game_id.type', new SortByRelation(Game::class)),
            AllowedSort::custom('game_id.description', new SortByRelation(Game::class)),
            AllowedSort::custom('company_id.key', new SortByRelation(Company::class)),
            ...self::getCreatorModifierSorts(),
        ];
    }
}
