<?php

namespace App\Sorts;

use App\Models\UserBank;
use Illuminate\Contracts\Database\Eloquent\Builder;

class SortByChildBank extends BaseSort
{
    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $query->orderBy(
            UserBank::select($this->getOrderByColumn($property))->whereColumn("user_banks.{$this->getMatchColumn($property)}", "{$query->from}.id"),
            $this->getDirection($descending)
        );
    }
}
