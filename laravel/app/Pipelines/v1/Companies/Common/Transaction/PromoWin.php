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

class PromoWin
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

        $transaction = Transaction::createTransaction(
            type: TransactionTypeEnum::MONEY_CREDITED,
            amount: $plate->amount,
            moneyType: MoneyTypeEnum::MONEY,
            user: CompanyRequest::getUser(),
            source: TransactionSourceEnum::GAME,
            category: TransactionCategoryEnum::GAME_PROMO_WIN_MONEY,
            txnId: $plate->txn_id,
            gameSessionId: CompanyRequest::getSessionId(),
            gameId: $game->id,
            companyId: CompanyRequest::getCompanyId(),
            providerId: $game->provider_id,
            companyGameId: $plate->company_game_id,
            companyRequestBody: $plate->company_request_body,
            companyCampaignId: $plate->company_campaign_id,
            companyCampaignType: $plate->company_campaign_type,
        );

        $collection->put('transaction', $transaction);

        return $next($collection);
    }
}
