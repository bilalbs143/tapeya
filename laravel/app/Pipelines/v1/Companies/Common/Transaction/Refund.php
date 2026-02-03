<?php

namespace App\Pipelines\v1\Companies\Common\Transaction;

use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Facades\CompanyRequest;
use App\Models\Transaction;
use Closure;
use Illuminate\Support\Collection;

class Refund
{
    /**
     * Handle the given input.
     *
     * @return mixed
     */
    public function handle(Collection $collection, Closure $next)
    {
        $plate = $collection->get('plate');
        $game = $collection->get('game');
        $referenceDebitTransaction = $collection->get('reference_debit_transaction');

        $transaction = Transaction::createTransaction(
            type: TransactionTypeEnum::MONEY_CREDITED,
            amount: $plate->amount,
            moneyType: MoneyTypeEnum::MONEY,
            user: CompanyRequest::getUser(),
            source: TransactionSourceEnum::GAME,
            category: TransactionCategoryEnum::GAME_REFUNDED_MONEY,
            txnId: $plate->txn_id,
            debitReferenceTransactionId: $referenceDebitTransaction->id,
            gameSessionId: CompanyRequest::getSessionId(),
            gameId: $game ? $game->id : null,
            companyId: CompanyRequest::getCompanyId(),
            providerId: $game ? $game->provider_id : null,
            companyGameId: $plate->company_game_id,
            companyRoundId: $plate->company_round_id,
            companyRequestBody: $plate->company_request_body,
        );

        $referenceDebitTransaction->update([
            'refunded_at' => now(),
        ]);

        $collection->put('transaction', $transaction);

        return $next($collection);
    }
}
