<?php

namespace App\Pipelines\v1\Companies\Vinus\Preparer;

use App\Http\Requests\Seamless\Vinus\VinusRequest;
use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
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
        /** @var VinusRequest $request */
        $request = $collection->get('request');
        $referenceCreditebitTransaction = $collection->get('reference_credit_transaction');

        $plate = VinusSeamlessService::preparePlate($request, amount: $referenceCreditebitTransaction->amount);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
