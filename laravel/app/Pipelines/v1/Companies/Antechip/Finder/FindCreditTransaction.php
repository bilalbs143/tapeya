<?php

namespace App\Pipelines\v1\Companies\Antechip\Finder;

use App\Http\Requests\Seamless\Antechip\BaseAntechipRequest;
use App\Models\Transaction;
use Closure;
use Illuminate\Support\Collection;

class FindCreditTransaction
{
    /**
     * Handle the given input.
     *
     * @param  Collection  $collection
     * @return mixed
     */
    public function handle(Collection|BaseAntechipRequest $collection, Closure $next)
    {
        if ($collection instanceof BaseAntechipRequest) {
            $collection = collect(['request' => $collection]);
        }
        $request = $collection->get('request');
        $creditTransaction = Transaction::active()->win()->byTxnId($request->getReferenceCreditTransaction())->firstOrFail();

        $collection->put('reference_credit_transaction', $creditTransaction);

        return $next($collection);
    }
}
