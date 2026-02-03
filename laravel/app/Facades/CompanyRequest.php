<?php

namespace App\Facades;

use App\Utils\Services\Companies\Request\CompanyRequestService;
use Illuminate\Support\Facades\Facade;

class CompanyRequest extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return CompanyRequestService::class;
    }
}
