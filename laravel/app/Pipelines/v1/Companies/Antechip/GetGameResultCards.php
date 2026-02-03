<?php

namespace App\Pipelines\v1\Companies\Antechip;

use App\Jobs\ResultCards\GetAntechipResultCards;
use App\Models\Transaction;
use Closure;
use Illuminate\Support\Collection;

class GetGameResultCards
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $transaction = $collection->get('transaction');
        $transaction = Transaction::find($transaction->id);
        GetAntechipResultCards::dispatch($transaction)->delay(now()->addMinutes(8));

        return $next($collection);
    }
}
