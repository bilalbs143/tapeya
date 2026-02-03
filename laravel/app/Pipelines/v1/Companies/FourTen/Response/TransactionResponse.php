<?php

namespace App\Pipelines\v1\Companies\FourTen\Response;

use Closure;
use Illuminate\Support\Collection;

class TransactionResponse
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        // Just pass through - response will be handled by SuccessResponse
        return $next($collection);
    }
}
