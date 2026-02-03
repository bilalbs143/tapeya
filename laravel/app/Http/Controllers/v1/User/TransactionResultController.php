<?php

namespace App\Http\Controllers\v1\User;

use App\Enums\TransactionResult\TransactionResultState;
use App\Http\Resources\v1\TransactionResult\TransactionResultResource;
use App\Models\TransactionResult;

class TransactionResultController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(TransactionResult::class, TransactionResultResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'debit_transaction',
            'credit_transaction',
            'refund_transaction',
            'cancel_transaction',
            'game',
            'user',
            'transactions',
        ])->whereBelongsTo(auth()->user());
    }

    public function realTimeWinners()
    {
        $records = $this->model->with([
            'debit_transaction',
            'credit_transaction',
            'refund_transaction',
            'cancel_transaction',
            'game',
            'user',
            'transactions',
        ])->where('state', TransactionResultState::WIN)->latest('id')->take(20)->get();

        return $this->resource::collection($records);
    }
}
