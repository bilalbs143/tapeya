<?php

namespace App\Utils\Constants;

class ApiConstants
{
    public const PER_PAGE = 20;

    public static function perPage()
    {
        return request()->has('perPage') ? request('perPage') : self::PER_PAGE;
    }
}
