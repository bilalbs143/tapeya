<?php

namespace App\Pipelines\v1\Companies\TheBigHit\Preparer;

use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
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
        /** @var ResultRequest $request */
        $request = $collection->get('request');

        $plate = TheBigHitSeamlessService::preparePlate($request, $request->getPayoutAmount());

        $plate->txn_id = $plate->txn_id.'w';

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
