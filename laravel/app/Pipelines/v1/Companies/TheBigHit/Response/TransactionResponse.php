<?php

namespace App\Pipelines\v1\Companies\TheBigHit\Response;

use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
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
        /** @var Transaction $transaction */
        $transaction = $collection->get('transaction');
        /** @var ResultRequest $request */
        $request = $collection->get('request');

        $requestId = $request->getRequestId();
        $data = [];
        if ($transaction->isBet()) {
            $data = TheBigHitSeamlessService::getDebitTransaction($transaction, $requestId);
        }
        if ($transaction->isWin()) {
            $data = TheBigHitSeamlessService::getCreditTransaction($transaction, $requestId);
        }

        $c = collect(['data' => $data]);
        $c->put('message', 'Debit Successful');

        return $next($c);
    }
}
