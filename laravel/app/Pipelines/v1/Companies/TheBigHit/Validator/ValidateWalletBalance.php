<?php

namespace App\Pipelines\v1\Companies\TheBigHit\Validator;

use App\Enums\Seamless\TheBigHit\TheBigHitStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
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
        /** @var ResultRequest $request */
        $request = $collection->get('request');

        $holdingMoney = CompanyRequest::holdingMoney();

        if ($request->getTotalBetAmount() > $holdingMoney) {
            throw new FailureException(__('thebighit.no_funds'), customCode: TheBigHitStatusCode::INSUFFICIENT_FUNDS);
        }

        return $next($collection);
    }
}
