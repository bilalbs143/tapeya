<?php

namespace App\Utils\Services\Companies\Seamless;

use App\Facades\CompanyRequest;
use App\Http\Requests\Seamless\Antechip\BaseAntechipRequest;
use App\Models\User;
use App\Utils\Services\Utils;

class AntechipSeamlessService extends BaseSeamlessService
{
    public static function getStatus(string $message, bool $provider_auth_error = false, bool $auth_error = false, bool $success = false, bool $debit_success = false, bool $credit_success = false, bool $refund_success = false, bool $bonus_success = false, bool $promo_win_success = false, bool $jackpot_success = false, bool $endround_success = false, bool $validation_failure = false, bool $cancel_success = false, $checkFunds = false)
    {
        return [
            'message' => $message,
            'success' => $success,
            'no_funds' => $checkFunds ? CompanyRequest::hasNoFunds() : false,
            'debit_success' => $debit_success,
            'credit_success' => $credit_success,
            'auth_error' => $auth_error,
            'refund_success' => $refund_success,
            'cancel_success' => $cancel_success,
            'provider_auth_error' => $provider_auth_error,
            'bonus_success' => $bonus_success,
            'promo_win_success' => $promo_win_success,
            'jackpot_success' => $jackpot_success,
            'endround_success' => $endround_success,
            'validation_failure' => $validation_failure,
        ];
    }

    public static function getUser(User $user)
    {
        $data = [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'email' => null,
            'phone' => null,
            'phone_alt' => null,
            'country' => null,
            'currency' => 'KRW',
            'balance' => number_format((float) $user->holding_money ?: 0, 4, '.', ''),
            'token' => CompanyRequest::getSessionToken(),
            'bonus' => number_format((float) 0, 4, '.', ''),
            'ip_address' => CompanyRequest::getSession()->ip_address,
        ];

        return $data;
    }

    public static function getProcessingTime()
    {
        return Utils::calculateTimeTaken(CompanyRequest::getStartTime());
    }

    public static function preparePlate(BaseAntechipRequest $request, $amount = null, array $extra = [])
    {
        $plate = [
            'amount' => $amount ?: $request->getAmount(),
            'txn_id' => $request->getTransactionId(),
            'company_game_id' => $request->getGameId(),
            'company_request_body' => $request->all(),
            ...$extra,
        ];

        $plate['company_round_id'] = $request->getRoundId();

        return (object) $plate;
    }
}
