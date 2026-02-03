<?php

namespace App\Http\Controllers\v1\Admin;

use App\Enums\Transaction\ExchangeRequestStatusEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Http\Requests\v1\Admin\ExchangeRequest\ApproveExchangeRequest;
use App\Http\Resources\v1\ExchangeRequest\ExchangeRequestResource;
use App\Models\ExchangeRequest;
use App\Models\Transaction;
use Exception;

class ExchangeRequestController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(ExchangeRequest::class, ExchangeRequestResource::class, 'exchange_request');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'approver',
            'rejector',
            'default_bank',
        ])->filterByAgentRole('created_by', true);
    }

    public function show(int $id)
    {
        $record = $this->baseQuery()->findOrFail($id);

        return $this->_show($record);
    }

    public function approve(ExchangeRequest $exchangeRequest, ApproveExchangeRequest $request)
    {
        $record = ExchangeRequest::filterByAgentRole('created_by', true)->pending()->findOrFail($exchangeRequest->id);
        $data = $request->validated();

        try {
            $transaction = Transaction::createTransaction(
                $record->type,
                $data['approved_money'],
                $record->money_type,
                $record->creator,
                $record,
                category: $record->category
            );
            $record->approve(ExchangeRequestStatusEnum::APPROVED, [
                'approved_money' => $data['approved_money'],
                'before_money' => $transaction->before_money,
                'after_money' => $transaction->after_money,
            ], cb: fn ($record) => $record->afterApprove($transaction));

            return $this->success(new ExchangeRequestResource($record), 'exchange_request_approved');
        } catch (Exception $e) {
            return $this->failure($e->getMessage());
        }
    }

    public function reject(ExchangeRequest $exchangeRequest)
    {
        $record = ExchangeRequest::filterByAgentRole('created_by', true)->pending()->findOrFail($exchangeRequest->id);

        $record->reject(ExchangeRequestStatusEnum::REJECTED);

        if ($record->type === TransactionTypeEnum::DEPOSIT || $record->type === TransactionTypeEnum::WITHDRAW) {
            $holdingMoney = $record->creator?->wallet?->holding_money ?? 0;
            $record->update([
                'approved_money' => 0,
                'after_money' => $holdingMoney,
            ]);
        }

        return $this->success(new ExchangeRequestResource($record), 'exchange_request_rejected');
    }
}
