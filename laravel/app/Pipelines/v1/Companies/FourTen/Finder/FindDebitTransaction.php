<?php

namespace App\Pipelines\v1\Companies\FourTen\Finder;

use App\Http\Requests\Seamless\FourTen\BaseFourTenRequest;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
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
        /** @var BaseFourTenRequest $request */
        $request = $collection->get('request');

        $debitReferenceNumber = FourTenSeamlessService::generateDebitReferenceNumber($request, $collection->get('game')?->id);
        $referenceDebitTransaction = Transaction::active()->bet()->byReferenceNumber($debitReferenceNumber)->firstOrFail();

        $collection->put('reference_debit_transaction', $referenceDebitTransaction);

        return $next($collection);
    }
}
