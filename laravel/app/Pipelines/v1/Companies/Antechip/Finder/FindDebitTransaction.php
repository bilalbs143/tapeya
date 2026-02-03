<?php

namespace App\Pipelines\v1\Companies\Antechip\Finder;

use App\Http\Requests\Seamless\Antechip\BaseAntechipRequest;
use App\Models\Transaction;
use Closure;
use Illuminate\Support\Collection;

class FindDebitTransaction
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
        $debitTransaction = Transaction::active()->bet()->byTxnId($request->getReferenceDebitTransaction())->firstOrFail();

        $collection->put('reference_debit_transaction', $debitTransaction);

        return $next($collection);
    }
}
