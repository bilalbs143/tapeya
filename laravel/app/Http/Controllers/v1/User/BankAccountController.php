<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Bank\BankAccountResource;
use App\Models\BankAccount;

class BankAccountController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(BankAccount::class, BankAccountResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->active();
    }
}
