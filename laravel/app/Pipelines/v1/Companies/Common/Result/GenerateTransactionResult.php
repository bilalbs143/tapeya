<?php

namespace App\Pipelines\v1\Companies\Common\Result;

use App\Models\TransactionResult;
use Closure;
use Illuminate\Support\Collection;

class GenerateTransactionResult
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $currentTransaction = $collection->get('transaction');

        $debitTransaction = $collection->get('reference_debit_transaction');
        $creditTransaction = $collection->get('reference_credit_transaction');

        $result = TransactionResult::generateResult(
            currentTransaction: $currentTransaction,
            debitTransaction: $debitTransaction,
            creditTransaction: $creditTransaction
        );

        if ($result) {
            $currentTransaction->transaction_result()->associate($result);
            $currentTransaction->save();
        }

        return $next($collection);
    }
}
