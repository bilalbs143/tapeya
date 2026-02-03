<?php

namespace App\Pipelines\v1\Companies\TheBigHit\Response;

use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class SuccessResponse
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $data = $collection->get('data');

        $response = TheBigHitSeamlessService::handleSuccessResponse(data: $data);

        return $next($response);
    }
}
