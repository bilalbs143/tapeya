<?php

namespace App\Pipelines\v1\Companies\Vinus\Preparer;

use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PrepareBonus
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        $collection->put('plate', VinusSeamlessService::preparePlate($request));

        return $next($collection);
    }
}
