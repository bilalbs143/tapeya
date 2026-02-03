<?php

namespace App\Pipelines\v1\Companies\FourTen\Preparer;

use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
use Closure;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

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
        $plate = FourTenSeamlessService::preparePlate($request);
        $plate->company_campaign_id = Str::uuid();
        $plate->company_campaign_type = 'promo_win';

        $collection->put('plate', $plate);

        return $next($collection);
    }
}
