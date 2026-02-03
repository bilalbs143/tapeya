<?php

namespace App\Http\Controllers\v1\Seamless;

use App\Enums\Seamless\Vinus\VinusChecksEnum;
use App\Enums\Seamless\Vinus\VinusCommandsEnum;
use App\Enums\Seamless\Vinus\VinusStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\Vinus\VinusRequest;
use App\Models\Transaction;
use App\Pipelines\v1\Companies\Common\Promotion\TrackPromotionProgress;
use App\Pipelines\v1\Companies\Common\Result\GenerateTransactionResult;
use App\Pipelines\v1\Companies\Common\Transaction\Bonus;
use App\Pipelines\v1\Companies\Common\Transaction\Cancel;
use App\Pipelines\v1\Companies\Common\Transaction\Credit;
use App\Pipelines\v1\Companies\Common\Transaction\Debit;
use App\Pipelines\v1\Companies\Common\Transaction\Jackpot;
use App\Pipelines\v1\Companies\Common\Transaction\PromoWin;
use App\Pipelines\v1\Companies\Common\Transaction\Refund;
use App\Pipelines\v1\Companies\Common\Validator\ValidateWalletBalance;
use App\Pipelines\v1\Companies\Vinus\Finder\FindCreditTransaction;
use App\Pipelines\v1\Companies\Vinus\Finder\FindDebitTransaction;
use App\Pipelines\v1\Companies\Vinus\Getter\GetGame;
use App\Pipelines\v1\Companies\Vinus\Preparer\PrepareBonus;
use App\Pipelines\v1\Companies\Vinus\Preparer\PrepareCancel;
use App\Pipelines\v1\Companies\Vinus\Preparer\PrepareCredit;
use App\Pipelines\v1\Companies\Vinus\Preparer\PrepareDebit;
use App\Pipelines\v1\Companies\Vinus\Preparer\PrepareJackpot;
use App\Pipelines\v1\Companies\Vinus\Preparer\PreparePromoWin;
use App\Pipelines\v1\Companies\Vinus\Preparer\PrepareRefund;
use App\Pipelines\v1\Companies\Vinus\Response\SuccessResponse;
use App\Pipelines\v1\Companies\Vinus\Response\TransactionResponse;
use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
use Illuminate\Http\JsonResponse;

class VinusController extends BaseSeamlessController
{
    public function index(VinusRequest $request)
    {
        $this->verifyPreChecks($request);

        return $this->process($request);
    }

    private function verifyPreChecks(VinusRequest $request)
    {
        $checkItems = explode(',', trim($request->check));
        $isValid = true;

        foreach ($checkItems as $item) {
            $isValid = match ((int) trim($item)) {
                VinusChecksEnum::CHECK_TOKEN->id() => VinusSeamlessService::verifyAuth(),
                VinusChecksEnum::CHECK_USER_EXISTS->id() => VinusSeamlessService::verifyAuth(),
                VinusChecksEnum::CHECK_USER_IS_ACTIVE->id() => VinusSeamlessService::isUserActive(),
                VinusChecksEnum::CHECK_USER_HAS_MORE_THAN_THE_AMOUNT_TO_BET->id() => VinusSeamlessService::verifyBetAmount($request->getAmount()),
                VinusChecksEnum::CHECK_TRANSACTION_HAS_ALREADY_BEEN_PROCESSED->id() => ! VinusSeamlessService::transactionExists($request->getTransactionId()),
                VinusChecksEnum::CHECK_IF_THERE_ARE_PROCESSED_TRANSACTIONS->id() => VinusSeamlessService::transactionExists($request->getTransactionId()),
                default => false
            };
            throw_unless($isValid, new FailureException(__('vinus.pre_check_failed'), customCode: $item));
        }
    }

    private function process(VinusRequest $request): JsonResponse
    {
        return match ($request->command) {
            VinusCommandsEnum::AUTHENTICATE->value => $this->authenticate($request),
            VinusCommandsEnum::BALANCE->value => $this->balance($request),
            VinusCommandsEnum::BET->value => $this->debit($request),
            VinusCommandsEnum::BET_WIN->value => $this->processBetWin($request),
            VinusCommandsEnum::WIN->value => $this->credit($request),
            VinusCommandsEnum::WIN_ADD->value => $this->winAdd($request),
            VinusCommandsEnum::BONUS->value => $this->bonus($request),
            VinusCommandsEnum::BONUS_WIN->value => $this->bonusWin($request),
            VinusCommandsEnum::JACKPOT_WIN->value => $this->jackpot($request),
            VinusCommandsEnum::PROMO_WIN->value => $this->promo($request),
            VinusCommandsEnum::CANCEL->value => $this->processCancel($request),
            default => throw new FailureException(__('vinus.invalid_command'), customCode: VinusStatusCode::VALIDATION_ERRORS),
        };
    }

    private function authenticate(VinusRequest $request): JsonResponse
    {
        $userInfo = VinusSeamlessService::getAuthData();

        return VinusSeamlessService::handleSuccessResponse(data: $userInfo);
    }

    private function balance(VinusRequest $request): JsonResponse
    {
        return VinusSeamlessService::handleSuccessResponse(data: [
            'balance' => VinusSeamlessService::getHoldingMoney(),
        ]);
    }

    private function processBetWin(VinusRequest $request): JsonResponse
    {
        $getRequest = fn ($amount, $transactionId) => new VinusRequest([
            ...$request->all(),
            'command' => $request->command,
            'check' => $request->check,
            'timestamp' => $request->timestamp,
            'data' => [
                'user_id' => $request->getData('user_id'),
                'transaction_id' => $transactionId,
                'game_id' => $request->getData('game_id'),
                'round_id' => $request->getData('round_id'),
                'game_type' => $request->getData('game_type'),
                'game_sort' => $request->getData('game_sort'),
                'vendor' => $request->getData('vendor'),
                'game' => $request->getData('game'),
                'amount' => $amount,
            ],
        ]);

        $betRequest = $getRequest($request->getData('bet'), $request->getData('transaction_id'));
        $winRequest = $getRequest($request->getData('win'), $request->getData('transaction_id').'w');

        $this->debit($betRequest);
        $this->credit($winRequest);

        return VinusSeamlessService::handleSuccessResponse(addBalance: true);
    }

    private function debit(VinusRequest $request): JsonResponse
    {
        return $this->run($request, [
            GetGame::class,
            ValidateWalletBalance::class,
            PrepareDebit::class,
            Debit::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            // GetGameResultCards::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    private function credit(VinusRequest $request): JsonResponse
    {
        return $this->run($request, [
            GetGame::class,
            PrepareCredit::class,
            FindDebitTransaction::class,
            Credit::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            // GetGameResultCards::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    private function winAdd(VinusRequest $request): JsonResponse
    {
        return $this->credit($request);
    }

    public function bonus(VinusRequest $request): JsonResponse
    {
        return $this->run($request, [
            GetGame::class,
            PrepareBonus::class,
            Bonus::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function bonusWin(VinusRequest $request): JsonResponse
    {
        return $this->bonus($request);
    }

    public function promo(VinusRequest $request): JsonResponse
    {
        return $this->run($request, [
            GetGame::class,
            PreparePromoWin::class,
            PromoWin::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function jackpot(VinusRequest $request): JsonResponse
    {
        return $this->run($request, [
            GetGame::class,
            PrepareJackpot::class,
            FindDebitTransaction::class,
            Jackpot::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    private function processCancel(VinusRequest $request)
    {
        $transaction = Transaction::byTxnId($request->getTransactionId())->first();

        if (! $transaction) {
            throw new FailureException(__('vinus.pre_check_failed'), customCode: 0);
        }

        if (! $transaction->isActive()) {
            return VinusSeamlessService::handleSuccessResponse(addBalance: true);
        }

        if ($transaction->isWin()) {
            return $this->cancel($request);
        }

        if ($transaction->isBet()) {
            return $this->refund($request);
        }

        throw new FailureException(__('vinus.pre_check_failed'), customCode: VinusChecksEnum::CHECK_IF_THERE_ARE_PROCESSED_TRANSACTIONS->value);
    }

    private function cancel(VinusRequest $request)
    {
        return $this->run($request, [
            GetGame::class,
            FindCreditTransaction::class,
            PrepareCancel::class,
            Cancel::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }

    public function refund(VinusRequest $request): JsonResponse
    {
        CompanyRequest::setIsRefund(true);

        return $this->run($request, [
            GetGame::class,
            FindDebitTransaction::class,
            PrepareRefund::class,
            Refund::class,
            GenerateTransactionResult::class,
            TrackPromotionProgress::class,
            TransactionResponse::class,
            SuccessResponse::class,
        ]);
    }
}
