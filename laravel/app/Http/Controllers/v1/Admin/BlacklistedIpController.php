<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\BlacklistedIp\CreateBlacklistedIpRequest;
use App\Http\Requests\v1\Admin\BlacklistedIp\UpdateBlacklistedIpRequest;
use App\Http\Resources\v1\BlacklistedIp\BlacklistedIpResource;
use App\Models\BlacklistedIp;

class BlacklistedIpController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(BlacklistedIp::class, BlacklistedIpResource::class, 'blacklisted_ip');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function store(CreateBlacklistedIpRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdateBlacklistedIpRequest $request, BlacklistedIp $blacklistedIp)
    {
        return $this->_patch($request, $blacklistedIp);
    }

    public function show(BlacklistedIp $blacklistedIp)
    {
        return $this->_show($blacklistedIp);
    }

    public function destroy(BlacklistedIp $blacklistedIp)
    {
        return $this->_destroy($blacklistedIp);
    }
}
