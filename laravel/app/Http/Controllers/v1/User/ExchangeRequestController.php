<?php

namespace App\Http\Controllers\v1\User;

use App\Enums\Transaction\TransactionTypeEnum;
use App\Events\User\ExchangeRequest\NewExchangeRequest;
use App\Http\Requests\v1\User\ExchangeRequest\ExchangeRequestRequest;
use App\Http\Resources\v1\ExchangeRequest\ExchangeRequestResource;
use App\Models\Bank;
use App\Models\ExchangeRequest;

class ExchangeRequestController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(ExchangeRequest::class, ExchangeRequestResource::class, 'exchange_request');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
        ])->byMe();
    }

    public function show(ExchangeRequest $exchangeRequest)
    {
        return $this->_show($exchangeRequest);
    }

    private function getBankData(Bank $bank, ?string $accountNumber = null, ?string $accountHolder = null, bool $isChanged = false)
    {
        return [
            'bank_id' => $bank->id,
            'bank_name' => $bank->name,
            'bank_code' => $bank->code,
            'account_number' => $accountNumber ?? null,
            'account_holder' => $accountHolder ?? null,
            'is_changed' => $isChanged,
        ];
    }

    public function store(ExchangeRequestRequest $request)
    {
        $user = auth()->user();
        $isRequestAlreadyPending = ExchangeRequest::pending()->whereBelongsTo($user, 'creator')->exists();

        if ($isRequestAlreadyPending) {
            return $this->failure('exchange_request_already_pending', 400);
        }

        $data = $request->validated();

        if ($data['type'] === TransactionTypeEnum::WITHDRAW->value) {
            $data['before_money'] = $user->wallet->holding_money;
            if ($data['before_money'] < $data['requested_money']) {
                return $this->failure('not_enough_balance_to_withdraw', 422);
            }
        }

        if ($data['type'] === TransactionTypeEnum::DEPOSIT->value) {
            $data['before_money'] = $user->wallet->holding_money;
        }

        if ($data['type'] === TransactionTypeEnum::POINTS_EXCHANGE->value) {
            $data['before_money'] = $user->wallet->points;
            if ($user->wallet->points < $data['requested_money']) {
                return $this->failure('not_enough_points_to_exchange', 422);
            }
        }

        if ($data['type'] === TransactionTypeEnum::COUPON_POINTS_EXCHANGE->value) {
            $data['before_money'] = $user->wallet->coupon_points;
            if ($user->wallet->coupon_points < $data['requested_money']) {
                return $this->failure('not_enough_coupon_points_to_exchange', 422);
            }
        }

        if ($data['type'] === TransactionTypeEnum::WITHDRAW_ROLLING_MONEY->value) {
            $data['before_money'] = $user->wallet->rolling_money;
            if ($data['before_money'] < $data['requested_money']) {
                return $this->failure('not_enough_balance_to_withdraw', 422);
            }
        }

        if ($data['type'] === TransactionTypeEnum::WITHDRAW_LOSING_MONEY->value) {
            $data['before_money'] = $user->wallet->losing_money;
            if ($data['before_money'] < $data['requested_money']) {
                return $this->failure('not_enough_balance_to_withdraw', 422);
            }
        }

        $userBank = $user->bank_account;
        if (! $userBank) {
            return $this->failure('user_bank_not_found', 404);
        }
        $data['user_bank_id'] = $userBank->id;

        if (isset($data['bank_id'])) {
            $bank = Bank::findOrFail($data['bank_id']);
            $data['bank'] = $this->getBankData($bank, $data['account_number'] ?? null, $data['account_holder'] ?? null, true);
        } else {
            $data['bank'] = $this->getBankData($userBank->bank, $userBank->account_number, $userBank->account_holder, false);
        }

        $data['is_first_request'] = ExchangeRequest::where('type', $data['type'])->whereBelongsTo($user, 'creator')->doesntExist();

        $record = ExchangeRequest::create($data);

        $record = ExchangeRequest::with([
            'default_bank',
            'creator',
        ])->findOrFail($record->id);

        NewExchangeRequest::dispatch($record);

        return $this->success(new ExchangeRequestResource($record), 'exchange_request_created', 201);
    }
}
