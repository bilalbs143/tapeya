<?php

namespace App\Pipelines\v1\Companies\Common\Transaction;

use Closure;
use Illuminate\Support\Collection;

class EndRound
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $referenceDebitTransaction = $collection->get('reference_debit_transaction');

        $referenceDebitTransaction->update([
            'round_ended_at' => now(),
        ]);

        $collection->put('transaction', $referenceDebitTransaction);

        return $next($collection);
    }
}
