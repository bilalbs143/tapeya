<?php

namespace App\Pipelines\v1\Companies\Vinus\Response;

use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
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
        $data = [];
        if ($transaction->isBet()) {
            $data = VinusSeamlessService::getDebitTransaction($transaction);
        }
        if ($transaction->isWin()) {
            $data = VinusSeamlessService::getCreditTransaction($transaction);
        }
        if ($transaction->isBonus()) {
            $data = VinusSeamlessService::getBonusTransaction($transaction);
        }
        if ($transaction->isPromoWin()) {
            $data = VinusSeamlessService::getPromoWinTransaction($transaction);
        }
        if ($transaction->isJackpot()) {
            $data = VinusSeamlessService::getJackpotTransaction($transaction);
        }
        if ($transaction->isCancel()) {
            $data = VinusSeamlessService::getCancelTransaction($transaction);
        }
        if ($transaction->isRefund()) {
            $data = VinusSeamlessService::getRefundTransaction($transaction);
        }

        $c = collect(['data' => $data]);
        $c->put('message', 'Debit Successful');

        return $next($c);
    }
}
