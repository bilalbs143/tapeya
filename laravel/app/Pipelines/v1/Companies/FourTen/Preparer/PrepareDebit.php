<?php

namespace App\Pipelines\v1\Companies\FourTen\Preparer;

use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
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
        $request = $collection->get('request');

        $plate = FourTenSeamlessService::preparePlate($request);

        $plate->reference_number = FourTenSeamlessService::generateDebitReferenceNumber($request, $collection->get('game')?->id);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
