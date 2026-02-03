<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Resources\v1\TransactionResult\TransactionResultResource;
use App\Models\TransactionResult;

class TransactionResultController extends BaseAdminController
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
            'debit_result_cards',
            'credit_result_cards',
        ])->filterByAgentRole();
    }
}
