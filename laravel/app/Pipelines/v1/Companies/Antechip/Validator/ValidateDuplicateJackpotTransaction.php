<?php

namespace App\Pipelines\v1\Companies\Antechip\Validator;

use App\Exceptions\Seamless\FailureException;
use App\Http\Requests\Seamless\Antechip\BaseAntechipRequest;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class ValidateDuplicateJackpotTransaction
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection|BaseAntechipRequest $collection, Closure $next)
    {
        if ($collection instanceof BaseAntechipRequest) {
            $collection = collect(['request' => $collection]);
        }

        $request = $collection->get('request');

        $existingTransaction = Transaction::jackpot()->byTxnId($request->getTransactionId())->first();
        if ($existingTransaction) {
            throw new FailureException(isSuccess: true, errors: [
                'transaction' => [
                    'transaction_id' => $existingTransaction->id,
                    'used_promo' => false,
                ],
            ], antechipStatus: AntechipSeamlessService::getStatus('Duplicate Jackpot Transaction', success: true, jackpot_success: true));
        }

        return $next($collection);
    }
}
