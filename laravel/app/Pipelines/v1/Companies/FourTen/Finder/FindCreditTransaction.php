<?php

namespace App\Pipelines\v1\Companies\FourTen\Finder;

use App\Enums\Seamless\FourTen\FourTenStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Models\Transaction;
use Closure;
use Illuminate\Support\Collection;

class FindCreditTransaction
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $request = $collection->get('request');

        // For CANCEL_WIN, we need to find the original WIN transaction
        $referenceForCancel = $request->input('reference_for_cancel');

        if ($referenceForCancel) {
            $transaction = Transaction::byTxnId($referenceForCancel)
                ->where('user_id', CompanyRequest::getUser()?->id)
                ->win()
                ->first();

            if (! $transaction) {
                throw new FailureException(__('fourten.credit_transaction_not_found'), customCode: FourTenStatusCode::FAILURE);
            }

            $collection->put('reference_credit_transaction', $transaction);
        }

        return $next($collection);
    }
}
