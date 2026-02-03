<?php

namespace App\Pipelines\v1\Companies\Vinus\Finder;

use App\Http\Requests\Seamless\Vinus\VinusRequest;
use App\Models\Transaction;
use Closure;
use Illuminate\Support\Collection;

class FindCreditTransaction
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        /** @var VinusRequest $request */
        $request = $collection->get('request');
        $creditTransaction = Transaction::active()->win()->byTxnId($request->getTransactionId())->firstOrFail();

        $collection->put('reference_credit_transaction', $creditTransaction);

        return $next($collection);
    }
}
