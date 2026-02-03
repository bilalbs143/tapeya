<?php

namespace App\Pipelines\v1\Companies\FourTen\Response;

use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
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
        $response = FourTenSeamlessService::handleSuccessResponse();

        return $next($response);
    }
}
