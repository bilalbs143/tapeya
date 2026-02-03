<?php

namespace App\Pipelines\v1\Companies\Antechip\Validator;

use App\Exceptions\Seamless\FailureException;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class ValidateDuplicateEndRoundTransaction
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        $existingTransaction = Transaction::bet()->whereNotNull('round_ended_at')->byTxnId($request->getReferenceDebitTransaction())->first();

        if ($existingTransaction) {
            throw new FailureException(isSuccess: true, errors: [
                'transaction' => [
                    'transaction_id' => $existingTransaction->id,
                    'used_promo' => false,
                ],
            ], antechipStatus: AntechipSeamlessService::getStatus('Duplicate End Round Transaction', success: true, endround_success: true));
        }

        return $next($collection);
    }
}
