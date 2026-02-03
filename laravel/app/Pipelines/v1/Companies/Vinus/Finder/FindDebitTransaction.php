<?php

namespace App\Pipelines\v1\Companies\Vinus\Finder;

use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\Vinus\VinusRequest;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class FindDebitTransaction
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

        if (CompanyRequest::hasIsRefund()) {
            /** @var Transaction $transaction */
            $referenceDebitTransaction = Transaction::active()->bet()->byTxnId($request->getTransactionId())->firstOrFail();
        } else {
            $debitReferenceNumber = VinusSeamlessService::generateDebitReferenceNumber($request, $collection->get('game')?->id);
            $referenceDebitTransaction = Transaction::active()->bet()->byReferenceNumber($debitReferenceNumber)->firstOrFail();
        }

        $collection->put('reference_debit_transaction', $referenceDebitTransaction);

        return $next($collection);
    }
}
