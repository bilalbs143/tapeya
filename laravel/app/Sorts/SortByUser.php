<?php

namespace App\Sorts;

use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;

class SortByUser extends BaseSort
{
    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $query->orderBy(
            User::select($this->getOrderByColumn($property))->whereColumn('users.id', "{$query->from}.{$this->getMatchColumn($property)}"),
            $this->getDirection($descending)
        );
    }
}
