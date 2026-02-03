<?php

namespace App\Http\Controllers\v1\User;

use App\Enums\Transaction\MoneyTypeEnum;
use App\Enums\Transaction\TransactionTypeEnum;
use App\Http\Resources\v1\Transaction\TransactionResource;
use App\Models\Transaction;

class TransactionController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(Transaction::class, TransactionResource::class);
    }

    protected function baseQuery(bool $byMe = true)
    {
        return $this->model->with([
            'creator',
            'user',
            'receiver',
        ])->when($byMe, function ($q) {
            $q->where('user_id', auth()->id());
        });
    }

    public function getLatestTransactions(TransactionTypeEnum $type)
    {
        $transactions = $this->baseQuery(false)->where('type', $type)->where('sub_type', MoneyTypeEnum::MONEY)
            ->whereDate('created_at', '>=', now()->subWeek())
            ->orderBy('money', 'desc')
            ->take(20)
            ->get();

        return $transactions;
    }

    public function realTimeDeposits()
    {
        return $this->resource::collection($this->getLatestTransactions(TransactionTypeEnum::DEPOSIT));
    }

    public function realTimeWithdrawals()
    {
        return $this->resource::collection($this->getLatestTransactions(TransactionTypeEnum::WITHDRAW));
    }
}
