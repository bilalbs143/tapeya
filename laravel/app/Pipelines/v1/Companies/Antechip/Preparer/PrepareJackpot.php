<?php

namespace App\Pipelines\v1\Companies\Antechip\Preparer;

use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class PrepareJackpot
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        $collection->put('plate', AntechipSeamlessService::preparePlate($request, extra: [
            'company_jackpot_id' => $request->getJackpotId(),
        ]));

        return $next($collection);
    }
}
