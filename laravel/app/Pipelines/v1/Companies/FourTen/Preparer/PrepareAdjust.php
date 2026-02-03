<?php

namespace App\Pipelines\v1\Companies\FourTen\Preparer;

use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PrepareAdjust
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');
        // ADJUST can have positive or negative amounts
        // Positive: add to balance
        // Negative: deduct from balance (if sufficient)
        $plate = FourTenSeamlessService::preparePlate($request);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
