<?php

namespace App\Pipelines\v1\Companies\FourTen\Validator;

use App\Enums\Seamless\FourTen\FourTenStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use Closure;
use Illuminate\Support\Collection;

class ValidateAdjustBalance
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');
        $amount = $request->getAmount();

        // If amount is negative, we need to deduct from balance
        // Check if user has sufficient balance
        if ($amount < 0) {
            $userBalance = CompanyRequest::holdingMoney();
            $absoluteAmount = abs($amount);

            if ($userBalance < $absoluteAmount) {
                // Don't perform ADJUST, return error
                throw new FailureException(__('fourten.insufficient_funds'), customCode: FourTenStatusCode::INSUFFICIENT_FUNDS);
            }
        }

        return $next($collection);
    }
}
