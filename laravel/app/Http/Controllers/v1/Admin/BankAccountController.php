<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\Bank\CreateBankAccountRequest;
use App\Http\Requests\v1\Admin\Bank\UpdateBankAccountRequest;
use App\Http\Resources\v1\Bank\BankAccountResource;
use App\Models\BankAccount;

class BankAccountController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(BankAccount::class, BankAccountResource::class, 'bank_account');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
            'bank',
        ]);
    }

    public function store(CreateBankAccountRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdateBankAccountRequest $request, BankAccount $bankAccount)
    {
        return $this->_patch($request, $bankAccount);
    }

    public function show(BankAccount $bankAccount)
    {
        return $this->_show($bankAccount);
    }

    public function destroy(BankAccount $bankAccount)
    {
        return $this->_destroy($bankAccount);
    }
}
