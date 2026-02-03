<?php

namespace App\Pipelines\v1\Companies\Antechip\Response;

use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
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

        $data['processing_time'] = AntechipSeamlessService::getProcessingTime();

        return $next(response()->json($data));
    }
}
