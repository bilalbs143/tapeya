<?php

namespace App\Pipelines\v1\Companies\Vinus\Response;

use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
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

        $response = VinusSeamlessService::handleSuccessResponse(data: $data);

        return $next($response);
    }
}
