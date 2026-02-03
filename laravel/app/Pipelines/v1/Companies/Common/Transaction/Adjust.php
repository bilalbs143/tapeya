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

class Adjust
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
        $amount = $plate->amount;

        // Determine if this is a credit (positive) or debit (negative) adjustment
        $isCredit = $amount >= 0;
        $absoluteAmount = abs($amount);

        $transaction = Transaction::createTransaction(
            type: $isCredit ? TransactionTypeEnum::MONEY_CREDITED : TransactionTypeEnum::MONEY_DEBITED,
            amount: $absoluteAmount,
            moneyType: MoneyTypeEnum::MONEY,
            user: CompanyRequest::getUser(),
            source: TransactionSourceEnum::GAME,
            category: $isCredit ? TransactionCategoryEnum::GAME_BONUS_MONEY : TransactionCategoryEnum::GAME_CANCELED_MONEY,
            txnId: $plate->txn_id,
            gameSessionId: CompanyRequest::getSessionId(),
            gameId: $game->id,
            companyId: CompanyRequest::getCompanyId(),
            providerId: $game->provider_id,
            companyGameId: $plate->company_game_id,
            companyRequestBody: $plate->company_request_body,
        );

        $collection->put('transaction', $transaction);

        return $next($collection);
    }
}
