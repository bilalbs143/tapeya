<?php

namespace App\Pipelines\v1\Companies\FourTen\Preparer;

use App\Http\Requests\Seamless\FourTen\BaseFourTenRequest;
use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
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
        /** @var BaseFourTenRequest $request */
        $request = $collection->get('request');

        $plate = FourTenSeamlessService::preparePlate($request, $request->getWinningAmount());

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
