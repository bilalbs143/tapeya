<?php

namespace App\Http\Controllers\v1\User;

use App\Http\Resources\v1\Provider\ProviderResource;
use App\Models\Provider;

class ProviderController extends BaseUserController
{
    public function __construct()
    {
        parent::__construct(Provider::class, ProviderResource::class, 'provider');
    }

    protected function baseQuery()
    {
        return $this->model->with('company')->active();
    }
}
