<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Requests\v1\Admin\WhitelistedIp\CreateWhitelistedIpRequest;
use App\Http\Requests\v1\Admin\WhitelistedIp\UpdateWhitelistedIpRequest;
use App\Http\Resources\v1\WhitelistedIp\WhitelistedIpResource;
use App\Models\WhitelistedIp;

class WhitelistedIpController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(WhitelistedIp::class, WhitelistedIpResource::class, 'whitelisted_ip');
    }

    protected function baseQuery()
    {
        return $this->model->with([
            'creator',
            'editor',
        ]);
    }

    public function store(CreateWhitelistedIpRequest $request)
    {
        return $this->_store($request);
    }

    public function patch(UpdateWhitelistedIpRequest $request, WhitelistedIp $whitelistedIp)
    {
        return $this->_patch($request, $whitelistedIp);
    }

    public function show(WhitelistedIp $whitelistedIp)
    {
        return $this->_show($whitelistedIp);
    }

    public function destroy(WhitelistedIp $whitelistedIp)
    {
        return $this->_destroy($whitelistedIp);
    }
}
