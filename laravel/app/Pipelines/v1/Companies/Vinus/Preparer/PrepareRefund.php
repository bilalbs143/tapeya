<?php

namespace App\Pipelines\v1\Companies\Vinus\Preparer;

use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
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

        $plate = VinusSeamlessService::preparePlate($request, amount: $referenceDebitTransaction->amount);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
