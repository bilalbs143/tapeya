<?php

namespace App\Http\Controllers\v1\Seamless;

use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\Antechip\BonusRequest;
use App\Http\Requests\Seamless\Antechip\CancelRequest;
use App\Http\Requests\Seamless\Antechip\CreditRequest;
use App\Http\Requests\Seamless\Antechip\DebitRequest;
use App\Http\Requests\Seamless\Antechip\EndRoundRequest;
use App\Http\Requests\Seamless\Antechip\JackpotRequest;
use App\Http\Requests\Seamless\Antechip\PromoWinRequest;
use App\Http\Requests\Seamless\Antechip\RefundRequest;
use App\Pipelines\v1\Companies\Antechip\Finder\FindCreditTransaction;
use App\Pipelines\v1\Companies\Antechip\Finder\FindDebitTransaction;
use App\Pipelines\v1\Companies\Antechip\GetGameResultCards;
use App\Pipelines\v1\Companies\Antechip\Getter\GetGame;
use App\Pipelines\v1\Companies\Antechip\Preparer\PrepareBonus;
use App\Pipelines\v1\Companies\Antechip\Preparer\PrepareCancel;
use App\Pipelines\v1\Companies\Antechip\Preparer\PrepareCredit;
use App\Pipelines\v1\Companies\Antechip\Preparer\PrepareDebit;
use App\Pipelines\v1\Companies\Antechip\Preparer\PrepareJackpot;
use App\Pipelines\v1\Companies\Antechip\Preparer\PreparePromoWin;
use App\Pipelines\v1\Companies\Antechip\Preparer\PrepareRefund;
use App\Pipelines\v1\Companies\Antechip\Response\SuccessResponse;
use App\Pipelines\v1\Companies\Antechip\Response\TransactionResponse;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicateBonusTransaction;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicateCancelTransaction;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicateCreditTransaction;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicateDebitTransaction;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicateEndRoundTransaction;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicateJackpotTransaction;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicatePromoWinTransaction;
use App\Pipelines\v1\Companies\Antechip\Validator\ValidateDuplicateRefundTransaction;
use App\Pipelines\v1\Companies\Common\Promotion\TrackPromotionProgress;
use App\Pipelines\v1\Companies\Common\Result\GenerateTransactionResult;
use App\Pipelines\v1\Companies\Common\Transaction\Bonus;
use App\Pipelines\v1\Companies\Common\Transaction\Cancel;
use App\Pipelines\v1\Companies\Common\Transaction\Credit;
use App\Pipelines\v1\Companies\Common\Transaction\Debit;
use App\Pipelines\v1\Companies\Common\Transaction\EndRound;
use App\Pipelines\v1\Companies\Common\Transaction\Jackpot;
use App\Pipelines\v1\Companies\Common\Transaction\PromoWin;
use App\Pipelines\v1\Companies\Common\Transaction\Refund;
use App\Pipelines\v1\Companies\Common\Validator\ValidateWalletBalance;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;

class AntechipController extends BaseSeamlessController
{
    public function reportErrors()
    {
        logger()->info('Antechip Reported Errors', request()->input('data.errors'));

        return response()->json(['errors_reported' => true]);
    }

    public function authenticate()
    {
        if (CompanyRequest::hasNotUser()) {
            return response()->json([
                'status' => AntechipSeamlessService::getStatus('User Not Found', auth_error: true),
            ]);
        }

        CompanyRequest::startSession();

        return response()->json([
            'status' => AntechipSeamlessService::getStatus('User Found', success: true),
            'user_info' => AntechipSeamlessService::getUser(CompanyRequest::getUser()),
            'processing_time' => AntechipSeamlessService::getProcessingTime(),
        ]);
    }

    public function balance()
    {
        return $this->authenticate();
    }

    public function debit(DebitRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateDebitTransaction::class,
            ValidateWalletBalance::class,
            PrepareDebit::class,
            Debit::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            GetGameResultCards::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function refund(RefundRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateRefundTransaction::class,
            FindDebitTransaction::class,
            PrepareRefund::class,
            Refund::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function credit(CreditRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateCreditTransaction::class,
            PrepareCredit::class,
            FindDebitTransaction::class,
            Credit::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            GetGameResultCards::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function cancel(CancelRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateCancelTransaction::class,
            FindCreditTransaction::class,
            PrepareCancel::class,
            Cancel::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function jackpot(JackpotRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateJackpotTransaction::class,
            PrepareJackpot::class,
            FindDebitTransaction::class,
            Jackpot::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function bonus(BonusRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateBonusTransaction::class,
            PrepareBonus::class,
            Bonus::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function promoWin(PromoWinRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicatePromoWinTransaction::class,
            PreparePromoWin::class,
            PromoWin::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function endround(EndRoundRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateEndRoundTransaction::class,
            FindDebitTransaction::class,
            EndRound::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }
}
