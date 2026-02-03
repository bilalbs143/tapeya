<?php

namespace App\Pipelines\v1\Companies\Antechip\Validator;

use App\Exceptions\Seamless\FailureException;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class ValidateDuplicateCreditTransaction
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        $existingTransaction = Transaction::win()->byTxnId($request->getTransactionId())->first();
        if ($existingTransaction) {
            throw new FailureException(isSuccess: true, errors: [
                'transaction' => [
                    'transaction_id' => $existingTransaction->id,
                    'used_promo' => false,
                ],
            ], antechipStatus: AntechipSeamlessService::getStatus('Duplicate Credit Transaction', success: true, credit_success: true));
        }

        return $next($collection);
    }
}
