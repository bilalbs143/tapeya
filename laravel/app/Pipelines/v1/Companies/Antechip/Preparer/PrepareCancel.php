<?php

namespace App\Pipelines\v1\Companies\Antechip\Preparer;

use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PrepareCancel
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');
        $referenceCreditebitTransaction = $collection->get('reference_credit_transaction');

        $collection->put('plate', AntechipSeamlessService::preparePlate($request, amount: $referenceCreditebitTransaction->amount));

        return $next($collection);
    }
}
