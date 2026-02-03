<?php

namespace App\Pipelines\v1\Companies\Common\Validator;

use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\FourTen\BaseFourTenRequest;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
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
        /** @var BaseFourTenRequest $request */
        $request = $collection->get('request');

        $holdingMoney = CompanyRequest::holdingMoney();

        if ($request->getAmount() > (float) $holdingMoney) {
            throw new FailureException(antechipStatus: AntechipSeamlessService::getStatus('Insufficient Balance', checkFunds: true));
        }

        return $next($collection);
    }
}
