<?php

namespace App\Pipelines\v1\Companies\Antechip\Preparer;

use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PrepareRefund
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');
        $referenceDebitTransaction = $collection->get('reference_debit_transaction');

        $collection->put('plate', AntechipSeamlessService::preparePlate($request, amount: $referenceDebitTransaction->amount));

        return $next($collection);
    }
}
