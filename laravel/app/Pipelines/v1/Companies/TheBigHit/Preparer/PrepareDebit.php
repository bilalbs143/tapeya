<?php

namespace App\Pipelines\v1\Companies\TheBigHit\Preparer;

use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
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
        /** @var ResultRequest $request */
        $request = $collection->get('request');

        $plate = TheBigHitSeamlessService::preparePlate($request, $request->getTotalBetAmount());

        $plate->reference_number = TheBigHitSeamlessService::generateDebitReferenceNumber($request, $collection->get('game')?->id);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
