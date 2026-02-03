<?php

namespace App\Http\Controllers\v1\Seamless;

use App\Enums\Seamless\TheBigHit\TheBigHitStatusCode;
use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\TheBigHit\AuthRequest;
use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
use App\Pipelines\v1\Companies\Common\Promotion\TrackPromotionProgress;
use App\Pipelines\v1\Companies\Common\Result\GenerateTransactionResult;
use App\Pipelines\v1\Companies\Common\Transaction\Credit;
use App\Pipelines\v1\Companies\Common\Transaction\Debit;
use App\Pipelines\v1\Companies\TheBigHit\Finder\FindDebitTransaction;
use App\Pipelines\v1\Companies\TheBigHit\Getter\GetGame;
use App\Pipelines\v1\Companies\TheBigHit\Preparer\PrepareCredit;
use App\Pipelines\v1\Companies\TheBigHit\Preparer\PrepareDebit;
use App\Pipelines\v1\Companies\TheBigHit\Response\SuccessResponse;
use App\Pipelines\v1\Companies\TheBigHit\Response\TransactionResponse;
use App\Pipelines\v1\Companies\TheBigHit\Validator\ValidateWalletBalance;
use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
use Illuminate\Http\JsonResponse;

class TheBigHitController extends BaseSeamlessController
{
    public function auth(AuthRequest $request)
    {
        $userInfo = TheBigHitSeamlessService::getAuthData();

        CompanyRequest::startSession();

        return TheBigHitSeamlessService::handleSuccessResponse(data: $userInfo);
    }

    public function result(ResultRequest $request)
    {
        throw_if(TheBigHitSeamlessService::transactionExists($request->getTransactionId()), new FailureException(__('thebighit.request_already_processed'), customCode: TheBigHitStatusCode::REQUEST_ID_ALREADY_PROCESSED));
        throw_if(TheBigHitSeamlessService::roundExists($request->getRoundId()), new FailureException(__('thebighit.round_already_processed'), customCode: TheBigHitStatusCode::ROUNDID_ALREADY_PROCESSED));

        $this->debit($request);

        $this->credit($request);

        return TheBigHitSeamlessService::handleSuccessResponse([
            'requestid' => $request->getRequestId(),
            'isResultApi' => true,
        ]);
    }

    private function debit(ResultRequest $request): JsonResponse
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

    private function credit(ResultRequest $request): JsonResponse
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
}
