<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\Bank\CreateBankRequest;
use App\Http\Requests\v1\Admin\Bank\UpdateBankRequest;
use App\Http\Resources\v1\Bank\BankResource;
use App\Models\Bank;

class BankController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(Bank::class, BankResource::class, 'bank');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function store(CreateBankRequest $request)
    {
        return $this->_store($request, dataMapper: function (&$data) {
            $data['name'] = $data['names']['ko'] ?? $data['names']['en'] ?? $data['names']['id'];
        });
    }

    public function patch(UpdateBankRequest $request, Bank $bank)
    {
        return $this->_patch($request, $bank, dataMapper: function (&$data) {
            if (isset($data['names'])) {
                $data['name'] = $data['names']['ko'] ?? $data['names']['en'] ?? $data['names']['id'];
            }
        });
    }

    public function show(Bank $bank)
    {
        return $this->_show($bank);
    }

    public function destroy(Bank $bank)
    {
        return $this->_destroy($bank);
    }
}
