<?php

namespace App\Utils\Constants;

class ApiConstants
{
    public const PER_PAGE = 20;

    public static function perPage(): int
    {
        return request()->has('per_page') ? (int) request('per_page') : self::PER_PAGE;
    }
}
