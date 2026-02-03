<?php

namespace App\Utils\Services\Companies\Seamless;

use App\Enums\Seamless\Vinus\VinusChecksEnum;
use App\Enums\Seamless\Vinus\VinusStatusCode;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\Vinus\VinusRequest;
use App\Models\Transaction;
use App\Models\User;

class VinusSeamlessService extends BaseSeamlessService
{
    public static function getAuthData(?User $user = null): array
    {
        $user = self::getUserRecord($user);

        return [
            'user_id' => CompanyRequest::getSession()->id,
            'user_username' => $user->username,
            'user_nickname' => $user->username,
            'balance' => $user->holding_money ?: 0,
        ];
    }

    public static function getBalance()
    {
        return [
            'balance' => self::getHoldingMoney(),
        ];
    }

    private static function getTransaction(array $extra = []): array
    {
        $balanceInfo = self::getBalance();

        return [
            ...$balanceInfo,
            ...$extra,
        ];
    }

    public static function getDebitTransaction(Transaction $transaction)
    {
        return self::getTransaction();
    }

    public static function getCreditTransaction(Transaction $transaction)
    {
        return self::getTransaction();
    }

    public static function getBonusTransaction(Transaction $transaction)
    {
        return self::getTransaction();
    }

    public static function getPromoWinTransaction(Transaction $transaction)
    {
        return self::getTransaction();
    }

    public static function getJackpotTransaction(Transaction $transaction)
    {
        return self::getTransaction();
    }

    public static function getCancelTransaction(Transaction $transaction)
    {
        return self::getTransaction();
    }

    public static function getRefundTransaction(Transaction $transaction)
    {
        return self::getTransaction();
    }

    public static function generateDebitReferenceNumber(VinusRequest $request, $systemGameId)
    {
        $gameId = $systemGameId ?: CompanyRequest::getSession()->game_id;

        return md5(CompanyRequest::getSessionId().'-'.$gameId.'-'.$request->getRoundId());
    }

    public static function preparePlate(VinusRequest $request, $amount = null, array $extra = [])
    {
        $plate = [
            'amount' => $amount ?: $request->getAmount(),
            'txn_id' => $request->getTransactionId(),
            'company_game_id' => $request->getGameId() ?? $request->_getGameId(),
            'company_request_body' => $request->all(),
            ...$extra,
        ];

        $plate['company_round_id'] = $request->getRoundId();

        return (object) $plate;
    }

    public static function handleSuccessResponse(
        string|int|null|VinusStatusCode $customCode = null,
        array $data = [],
        bool $addBalance = false,
        bool $hasErrors = false,
    ) {
        $response = [
            'result' => $customCode?->id() ?? VinusStatusCode::NO_ERROR->id(),
        ];

        if ($addBalance) {
            $response['data']['balance'] = self::getHoldingMoney();
        }

        if (in_array($customCode, [VinusChecksEnum::CHECK_TRANSACTION_HAS_ALREADY_BEEN_PROCESSED->id()])) {
            $response['result'] = 0;
        }

        if ($data) {
            $response[$hasErrors ? 'errors' : 'data'] = $data;
        }

        return response()->json($response);
    }

    public static function handleErrorResponse(
        string|int|null|VinusStatusCode $customCode = null,
        array $errors = [],
    ) {
        if (empty($customCode) || $customCode instanceof VinusStatusCode) {
            if (empty($customCode)) {
                $customCode = VinusStatusCode::SERVER_SIDE_ERROR->id();
            } else {
                $customCode = $customCode->id();
            }
        }

        $code = in_array($customCode, VinusChecksEnum::values()) ? $customCode : VinusStatusCode::SERVER_SIDE_ERROR->id();

        $response = [
            'result' => $code,
        ];

        if (in_array($code, VinusChecksEnum::values())) {
            if (
                in_array($code, [
                    VinusChecksEnum::CHECK_USER_HAS_MORE_THAN_THE_AMOUNT_TO_BET->id(),
                    VinusChecksEnum::CHECK_TRANSACTION_HAS_ALREADY_BEEN_PROCESSED->id(),
                    VinusChecksEnum::CHECK_IF_THERE_ARE_PROCESSED_TRANSACTIONS->id(),
                ])
            ) {
                $response['data']['balance'] = self::getHoldingMoney();
            }
        }

        if (in_array($code, [VinusChecksEnum::CHECK_TRANSACTION_HAS_ALREADY_BEEN_PROCESSED->id()])) {
            $response['result'] = 0;
        }

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response);
    }
}
