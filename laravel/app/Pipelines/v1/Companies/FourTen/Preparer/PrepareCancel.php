<?php

namespace App\Pipelines\v1\Companies\FourTen\Preparer;

use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
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

        $amount = $request->getAmount();

        $plate = FourTenSeamlessService::preparePlate($request, $amount);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
