<?php

namespace App\Pipelines\v1\Companies\Vinus\Preparer;

use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PrepareCredit
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        $plate = VinusSeamlessService::preparePlate($request);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
