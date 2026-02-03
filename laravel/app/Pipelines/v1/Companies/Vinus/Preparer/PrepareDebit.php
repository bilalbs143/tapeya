<?php

namespace App\Pipelines\v1\Companies\Vinus\Preparer;

use App\Http\Requests\Seamless\Vinus\VinusRequest;
use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PrepareDebit
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

        $plate = VinusSeamlessService::preparePlate($request);

        $plate->reference_number = VinusSeamlessService::generateDebitReferenceNumber($request, $collection->get('game')?->id);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
