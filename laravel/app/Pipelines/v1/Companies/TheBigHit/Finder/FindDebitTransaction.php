<?php

namespace App\Pipelines\v1\Companies\TheBigHit\Finder;

use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
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
        /** @var ResultRequest $request */
        $request = $collection->get('request');

        $debitReferenceNumber = TheBigHitSeamlessService::generateDebitReferenceNumber($request, $collection->get('game')?->id);
        $referenceDebitTransaction = Transaction::active()->bet()->byReferenceNumber($debitReferenceNumber)->firstOrFail();

        $collection->put('reference_debit_transaction', $referenceDebitTransaction);

        return $next($collection);
    }
}
