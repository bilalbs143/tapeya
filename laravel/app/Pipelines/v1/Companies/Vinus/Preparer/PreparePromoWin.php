<?php

namespace App\Pipelines\v1\Companies\Vinus\Preparer;

use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PreparePromoWin
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        $plate = VinusSeamlessService::preparePlate($request, extra: [
            'company_campaign_id' => null,
            'company_campaign_type' => null,
        ]);

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
