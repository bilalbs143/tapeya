<?php

namespace App\Utils\Services\Companies\Seamless;

use App\Enums\Seamless\FourTen\FourTenStatusCode;
use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\FourTen\BaseFourTenRequest;
use App\Models\Transaction;
use App\Models\User;

class FourTenSeamlessService extends BaseSeamlessService
{
    /**
     * Handle error response for FourTen
     */
    public static function handleErrorResponse(int|string|null|FourTenStatusCode $customCode = null, array $errors = [])
    {
        $response = [
            'status' => 'Error',
            'balance' => self::getHoldingMoney(),
        ];

        // Add errors if provided
        if (! empty($errors)) {
            $response = array_merge($response, $errors);
        }

        return response()->json($response);
    }

    /**
     * Handle success response for FourTen
     */
    public static function handleSuccessResponse(array $data = [])
    {
        return response()->json([
            'status' => 'OK',
            'balance' => self::getHoldingMoney(),
            ...$data,
        ]);
    }

    /**
     * Get user balance (returns as float for raw text response)
     */
    public static function getBalance(): float
    {
        return self::getHoldingMoney();
    }

    /**
     * Prepare plate data for transactions
     */
    public static function preparePlate(BaseFourTenRequest $request, $amount = null, array $extra = [])
    {
        $plate = [
            'amount' => $amount ?: $request->getAmount(),
            'txn_id' => $request->getReference() ?? $request->getTransactionId(),
            'company_game_id' => $request->getGameId(),
            'company_request_body' => $request->all(),
            ...$extra,
        ];

        $plate['company_round_id'] = $request->getRoundId();
        $plate['reference'] = $request->getReference();

        return (object) $plate;
    }

    /**
     * Generate reference number for debit transactions
     */
    public static function generateDebitReferenceNumber(BaseFourTenRequest $request, $systemGameId)
    {
        if ($request->filled('transaction_id')) {
            return $request->input('transaction_id');
        }

        $gameId = $systemGameId ?: CompanyRequest::getSession()->game_id;

        return md5(CompanyRequest::getSessionId().'-'.$gameId);
    }

    /**
     * Get debit transaction response
     */
    public static function getDebitTransaction(Transaction $transaction)
    {
        return [
            'status' => 'OK',
            'balance' => self::getHoldingMoney(),
        ];
    }

    /**
     * Get credit transaction response
     */
    public static function getCreditTransaction(Transaction $transaction)
    {
        return [
            'status' => 'OK',
            'balance' => self::getHoldingMoney(),
        ];
    }

    /**
     * Get bonus transaction response
     */
    public static function getBonusTransaction(Transaction $transaction)
    {
        return [
            'status' => 'OK',
            'balance' => self::getHoldingMoney(),
        ];
    }

    /**
     * Get promo win transaction response
     */
    public static function getPromoWinTransaction(Transaction $transaction)
    {
        return [
            'status' => 'OK',
            'balance' => self::getHoldingMoney(),
        ];
    }

    /**
     * Get cancel transaction response
     */
    public static function getCancelTransaction(Transaction $transaction)
    {
        return [
            'status' => 'OK',
            'balance' => self::getHoldingMoney(),
        ];
    }

    /**
     * Get refund transaction response
     */
    public static function getRefundTransaction(Transaction $transaction)
    {
        return [
            'status' => 'OK',
            'balance' => self::getHoldingMoney(),
        ];
    }
}
