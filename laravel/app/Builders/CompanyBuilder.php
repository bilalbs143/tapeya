<?php

namespace App\Builders;

use App\Enums\Company\CompanyEnum;
use Illuminate\Database\Eloquent\Builder;

class CompanyBuilder extends Builder
{
    public function active()
    {
        $this->whereNull('disabled_at');

        return $this;
    }

    public function key(CompanyEnum $key)
    {
        $this->where('key', $key);

        return $this;
    }
}
