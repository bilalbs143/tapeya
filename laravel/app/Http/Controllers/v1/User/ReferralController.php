<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\User\LimitedMemberResource;
use App\Models\User;

class ReferralController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(User::class, LimitedMemberResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->byMe('referred_by');
    }
}
