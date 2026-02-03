<?php

namespace App\Utils\Traits;

trait GlobalHelpersTrait
{
    public function trans(string $trans)
    {
        return __($trans);
    }
}
