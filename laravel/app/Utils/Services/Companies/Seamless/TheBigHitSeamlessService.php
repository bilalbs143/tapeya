<?php

namespace App\Utils\Services\Companies\Seamless;

use App\Enums\Seamless\TheBigHit\TheBigHitStatusCode;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\TheBigHit\ResultRequest;
use App\Models\Transaction;
use App\Models\User;

class TheBigHitSeamlessService extends BaseSeamlessService
{
    public static function generateSignature($requestId, $token = null)
    {
        $secret = CompanyRequest::getCompany()->getConfig('secret');
        if (! $token) {
            return md5($secret.'#'.$requestId);
        }

        return md5($secret.'#'.$requestId.'#'.$token);
    }

    public static function handleErrorResponse(int|string|null|TheBigHitStatusCode $customCode = null, ?string $message = null)
    {
        return response()->json([
            'status' => $customCode?->id(),
            ...($message ? ['message' => $message] : []),
        ]);
    }

    public static function handleSuccessResponse(array $data = [], bool $addBalance = true)
    {
        $respData = [
            'result' => TheBigHitStatusCode::NO_ERROR->id(),
            ...($addBalance ? ['amount' => self::getHoldingMoney()] : []),
            ...(isset($data['requestid']) ? ['requestid' => $data['requestid']] : []),
            'data' => $data,
        ];

        if (isset($data['isResultApi'])) {
            unset($respData['data']);
        }

        return response()->json($respData);
    }

    public static function getAuthData(?User $user = null)
    {
        $user = self::getUserRecord($user);

        return [
            'member_no' => $user->id,
            'userid' => $user->username,
            'currency' => strtoupper($user->currency),
            'amount' => $user->holding_money,
        ];
    }

    public static function preparePlate(ResultRequest $request, $amount, array $extra = [])
    {
        $plate = [
            'amount' => $amount,
            'txn_id' => $request->getTransactionId(),
            'company_game_id' => $request->getGameId(),
            'company_request_body' => $request->all(),
            ...$extra,
        ];

        $plate['company_round_id'] = $request->getRoundId();

        return (object) $plate;
    }

    public static function generateDebitReferenceNumber(ResultRequest $request, $systemGameId)
    {
        $gameId = $systemGameId ?: CompanyRequest::getSession()->game_id;

        return md5(CompanyRequest::getSessionId().'-'.$gameId.'-'.$request->getRoundId());
    }

    public static function getBalance()
    {
        return [
            'amount' => self::getHoldingMoney(),
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

    public static function getDebitTransaction(Transaction $transaction, string $requestId)
    {
        return self::getTransaction([
            'requestid' => $requestId,
            'isResultApi' => true,
        ]);
    }

    public static function getCreditTransaction(Transaction $transaction, string $requestId)
    {
        return self::getTransaction([
            'requestid' => $requestId,
            'isResultApi' => true,
        ]);
    }
}
