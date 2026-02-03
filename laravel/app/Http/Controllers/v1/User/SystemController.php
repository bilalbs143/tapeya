<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\System\UserSystemInfoResource;

class SystemController extends BaseUserController
{
    protected function baseQuery()
    {
        return null;
    }

    public function info()
    {
        return $this->success(new UserSystemInfoResource([]));
    }
}
