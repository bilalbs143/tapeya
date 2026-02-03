<?php

namespace App\Http\Controllers\v1\Seamless;

use App\Enums\Seamless\FourTen\FourTenStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\FourTen\BalanceRequest;
use App\Http\Requests\Seamless\FourTen\BettingDetailRequest;
use App\Http\Requests\Seamless\FourTen\BetWinRequest;
use App\Http\Requests\Seamless\FourTen\DebitRequest;
use App\Http\Requests\Seamless\FourTen\ResultRequest;
use App\Pipelines\v1\Companies\Common\Promotion\TrackPromotionProgress;
use App\Pipelines\v1\Companies\Common\Result\GenerateTransactionResult;
use App\Pipelines\v1\Companies\Common\Transaction\Adjust;
use App\Pipelines\v1\Companies\Common\Transaction\Cancel;
use App\Pipelines\v1\Companies\Common\Transaction\Credit;
use App\Pipelines\v1\Companies\Common\Transaction\Debit;
use App\Pipelines\v1\Companies\Common\Transaction\PromoWin;
use App\Pipelines\v1\Companies\Common\Transaction\Refund;
use App\Pipelines\v1\Companies\Common\Validator\ValidateWalletBalance;
use App\Pipelines\v1\Companies\FourTen\Finder\FindCreditTransaction;
use App\Pipelines\v1\Companies\FourTen\Finder\FindDebitTransaction;
use App\Pipelines\v1\Companies\FourTen\Getter\GetGame;
use App\Pipelines\v1\Companies\FourTen\Preparer\PrepareAdjust;
use App\Pipelines\v1\Companies\FourTen\Preparer\PrepareCancel;
use App\Pipelines\v1\Companies\FourTen\Preparer\PrepareCredit;
use App\Pipelines\v1\Companies\FourTen\Preparer\PrepareDebit;
use App\Pipelines\v1\Companies\FourTen\Preparer\PreparePromoWin;
use App\Pipelines\v1\Companies\FourTen\Preparer\PrepareRefund;
use App\Pipelines\v1\Companies\FourTen\Response\SuccessResponse;
use App\Pipelines\v1\Companies\FourTen\Response\TransactionResponse;
use App\Pipelines\v1\Companies\FourTen\Validator\ValidateAdjustBalance;
use App\Pipelines\v1\Companies\FourTen\Validator\ValidateDuplicateAdjustTransaction;
use App\Pipelines\v1\Companies\FourTen\Validator\ValidateDuplicateCancelTransaction;
use App\Pipelines\v1\Companies\FourTen\Validator\ValidateDuplicateCreditTransaction;
use App\Pipelines\v1\Companies\FourTen\Validator\ValidateDuplicateDebitTransaction;
use App\Pipelines\v1\Companies\FourTen\Validator\ValidateDuplicatePromoWinTransaction;
use App\Pipelines\v1\Companies\FourTen\Validator\ValidateDuplicateRefundTransaction;
use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class FourTenController extends BaseSeamlessController
{
    /**
     * Balance Inquiry - Returns RAW TEXT (not JSON)
     * GET /api/balance
     */
    public function balance(BalanceRequest $request): Response
    {
        CompanyRequest::startSession();

        try {
            $balance = FourTenSeamlessService::getBalance();

            // Return raw text, not JSON
            return response($balance, 200)->header('Content-Type', 'text/plain');
        } catch (\Exception $e) {
            logger()->error('FourTen Balance Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // On error, return 0 balance
            return response('0', 200)->header('Content-Type', 'text/plain');
        }
    }

    /**
     * Bet (Debit) - Process betting
     * GET /api/bet
     */
    public function bet(DebitRequest $request): JsonResponse
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateDebitTransaction::class,
            ValidateWalletBalance::class,
            PrepareDebit::class,
            Debit::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    /**
     * Result - Process game result (WIN/CANCEL/PROMO_WIN/ADJUST/CANCEL_WIN)
     * GET /api/result
     */
    public function result(ResultRequest $request): JsonResponse
    {
        $transactionType = $request->getTransactionType();

        return match ($transactionType) {
            'WIN' => $this->processWin($request),
            'CANCEL' => $this->processRefund($request),
            'PROMO_WIN' => $this->processPromoWin($request),
            'ADJUST' => $this->processAdjust($request),
            'CANCEL_WIN' => $this->processCancelWin($request),
            default => throw new FailureException(__('fourten.invalid_transaction_type'), customCode: FourTenStatusCode::FAILURE),
        };
    }

    /**
     * Process WIN transaction
     */
    private function processWin(ResultRequest $request): JsonResponse
    {
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateCreditTransaction::class,
            PrepareCredit::class,
            FindDebitTransaction::class,
            Credit::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    /**
     * Process CANCEL transaction (cancel bet)
     */
    private function processRefund(ResultRequest $request): JsonResponse
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

    /**
     * Process PROMO_WIN transaction
     */
    private function processPromoWin(ResultRequest $request): JsonResponse
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

    /**
     * Process ADJUST transaction (positive or negative balance adjustment)
     * Used by Pragmatic Live / PGSoft only
     */
    private function processAdjust(ResultRequest $request): JsonResponse
    {
        // ValidateAdjustBalance will only validate if amount is negative
        // For positive amounts, it passes through
        return $this->run($request, [
            GetGame::class,
            ValidateDuplicateAdjustTransaction::class,
            ValidateAdjustBalance::class, // Only validates for negative amounts
            PrepareAdjust::class,
            Adjust::class, // Adjust pipeline handles both credit and debit
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    /**
     * Process CANCEL_WIN transaction (cancel winnings)
     * Used by vGame only
     */
    private function processCancelWin(ResultRequest $request): JsonResponse
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

    /**
     * BetWin - Process bet and win simultaneously
     * GET /api/betwin
     */
    public function betwin(BetWinRequest $request): JsonResponse
    {
        CompanyRequest::startSession();

        $betAmount = $request->getBetAmount();

        if ($betAmount > CompanyRequest::holdingMoney()) {
            throw new FailureException(__('fourten.insufficient_funds'), customCode: FourTenStatusCode::INSUFFICIENT_FUNDS);
        }

        $winAmount = $request->getWinAmount();

        // Build base data array from original request
        $baseData = [
            'user_id' => CompanyRequest::getUser()?->id,
            'vendorCode' => $request['vendorCode'] ?? '',
            'gameCode' => $request->getGameId(),
            'game_id' => $request->getRoundId(),
        ];

        $transactionID = Str::uuid()->toString();

        // Helper to create new request with modified parameters
        $getRequest = fn ($amount, $reference, $requestClass) => new $requestClass(array_merge($baseData, [
            'reference' => $reference,
            'transaction_id' => $transactionID,
            'amount' => $amount,
        ]));

        // Create and process bet request
        $betRequest = $getRequest($betAmount, $request->getTransactionId().'_bet', DebitRequest::class);

        $this->bet($betRequest);

        // Process win only if win amount > 0
        if ($winAmount > 0) {
            $winRequest = new ResultRequest(array_merge($baseData, [
                'transaction_id' => $transactionID,
                'amount' => $winAmount,
                'transaction_type' => 'WIN',
                'reference' => $request->getTransactionId().'_win', // Link to bet
            ]));

            $this->processWin($winRequest);
        }

        return FourTenSeamlessService::handleSuccessResponse();
    }

    /**
     * Betting Detail - Used only in Evolution
     * POST /api/betting_detail
     */
    public function bettingDetail(BettingDetailRequest $request): JsonResponse
    {
        // Just log the betting details and return success
        logger()->info('FourTen Betting Detail', [
            'user_id' => CompanyRequest::getUserId(),
            'transaction_id' => $request->getTransactionId(),
            'game_id' => $request->getRoundId(),
            'data' => $request->getBettingData(),
        ]);

        return FourTenSeamlessService::handleSuccessResponse();
    }
}
