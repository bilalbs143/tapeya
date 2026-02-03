<?php

namespace App\Pipelines\v1\Companies\FourTen\Validator;

use App\Exceptions\Seamless\FailureException;
use App\Models\Transaction;
use Closure;
use Illuminate\Support\Collection;

class ValidateDuplicateCancelTransaction
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        $existingTransaction = Transaction::cancel()->byTxnId($request->getReference() ?? $request->getTransactionId())->first();
        if ($existingTransaction) {
            throw new FailureException(isSuccess: true, errors: [
                'transaction' => [
                    'transaction_id' => $existingTransaction->id,
                ],
            ]);
        }

        return $next($collection);
    }
}
