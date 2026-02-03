<?php

namespace App\Http\Controllers\v1\Admin;

use App\Http\Resources\v1\System\SystemInfoResource;

class SystemController extends BaseAdminController
{
    protected function baseQuery()
    {
        return null;
    }

    public function info()
    {
        return $this->success(new SystemInfoResource([]));
    }
}
