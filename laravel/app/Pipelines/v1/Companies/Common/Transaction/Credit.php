<?php

namespace App\Pipelines\v1\Companies\Common\Transaction;

use App\Enums\Company\CompanyEnum;
use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionCategoryEnum;
use App\Enums\Transaction\TransactionSourceEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Models\Transaction;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use Closure;
use Illuminate\Support\Collection;

class Credit
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

        if ($plate->amount <= 0 && CompanyRequest::getCompany()->key === CompanyEnum::ANTECHIP) {
            throw new FailureException(isSuccess: true, errors: [
                'transaction' => [
                    'transaction_id' => \App\Utils\Services\Utils::generateRandomToken(20),
                    'used_promo' => false,
                ],
            ], antechipStatus: AntechipSeamlessService::getStatus('Cannot Create Credit Transaction', success: true, credit_success: true));
        }

        $transaction = Transaction::createTransaction(
            type: TransactionTypeEnum::MONEY_CREDITED,
            amount: $plate->amount,
            moneyType: MoneyTypeEnum::MONEY,
            user: CompanyRequest::getUser(),
            source: TransactionSourceEnum::GAME,
            category: TransactionCategoryEnum::GAME_BET_WIN_MONEY,
            txnId: $plate->txn_id,
            debitReferenceTransactionId: $referenceDebitTransaction->id,
            gameSessionId: CompanyRequest::getSessionId(),
            gameId: $game->id,
            companyId: CompanyRequest::getCompanyId(),
            providerId: $game->provider_id,
            companyGameId: $plate->company_game_id,
            companyRoundId: $plate->company_round_id,
            companyRequestBody: $plate->company_request_body,
        );

        $collection->put('transaction', $transaction);

        return $next($collection);
    }
}
