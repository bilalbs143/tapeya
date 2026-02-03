<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Bank\BankResource;
use App\Models\Bank;

class BankController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(Bank::class, BankResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->query()->active();
    }
}
