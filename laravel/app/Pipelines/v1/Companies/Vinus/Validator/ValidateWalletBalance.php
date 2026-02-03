<?php

namespace App\Pipelines\v1\Companies\Vinus\Validator;

use App\Enums\Seamless\Vinus\VinusStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\Vinus\VinusRequest;
use Closure;
use Illuminate\Support\Collection;

class ValidateWalletBalance
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        /** @var VinusRequest $request */
        $request = $collection->get('request');

        $holdingMoney = CompanyRequest::holdingMoney();

        if ($request->getAmount() > $holdingMoney) {
            throw new FailureException(__('vinus.no_funds'), customCode: VinusStatusCode::NO_FUNDS);
        }

        return $next($collection);
    }
}
