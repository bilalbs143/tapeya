<?php

namespace App\Pipelines\v1\Companies\Antechip\Response;

use App\Facades\CompanyRequest;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
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
        $c = collect();

        if ($transaction->isBet()) {
            if ($transaction->round_ended_at) {
                $data['status'] = AntechipSeamlessService::getStatus('Round Ended Successfully', success: true, endround_success: true);
            } else {
                $data['status'] = AntechipSeamlessService::getStatus('Debit Successful', success: true, debit_success: true);
            }
        }

        if ($transaction->isWin()) {
            $data['status'] = AntechipSeamlessService::getStatus('Credit Successful', success: true, credit_success: true);
        }

        if ($transaction->isRefund()) {
            $data['status'] = AntechipSeamlessService::getStatus('Refund Successful', success: true, refund_success: true);
        }

        if ($transaction->isCancel()) {
            $data['status'] = AntechipSeamlessService::getStatus('Cancel Successful', success: true, cancel_success: true);
        }

        if ($transaction->isJackpot()) {
            $data['status'] = AntechipSeamlessService::getStatus('Jackpot Successful', success: true, jackpot_success: true);
        }

        if ($transaction->isBonus()) {
            $data['status'] = AntechipSeamlessService::getStatus('Bonus Successful', success: true, bonus_success: true);
        }

        if ($transaction->isPromoWin()) {
            $data['status'] = AntechipSeamlessService::getStatus('Promo Win Successful', success: true, promo_win_success: true);
        }

        if ($transaction) {
            $this->resolveTransactionResponse($collection, $data);
        }

        $c->put('data', $data);

        return $next($c);
    }

    private function resolveTransactionResponse($collection, &$data)
    {
        $transaction = $collection->get('transaction');
        $data['user_info'] = AntechipSeamlessService::getUser(CompanyRequest::getUser());
        $data['transaction'] = [
            'transaction_id' => $transaction->id,
            'used_promo' => false,
        ];
    }
}
