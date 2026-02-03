<?php

namespace App\Sorts;

use App\Models\UserBank;
use Illuminate\Contracts\Database\Eloquent\Builder;

class SortByUserByBank extends BaseSort
{
    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $query->orderBy(
            UserBank::select($this->getOrderByColumn($property))->whereColumn('user_banks.user_id', "{$query->from}.{$this->getMatchColumn($property)}"),
            $this->getDirection($descending)
        );
    }
}
