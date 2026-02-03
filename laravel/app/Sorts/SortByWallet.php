<?php

namespace App\Sorts;

use App\Models\UserWallet;
use Illuminate\Contracts\Database\Eloquent\Builder;

class SortByWallet extends BaseSort
{
    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $query->orderBy(
            UserWallet::select($this->getOrderByColumn($property))->whereColumn('user_wallets.user_id', "{$query->from}.{$this->getMatchColumn($property)}"),
            $this->getDirection($descending)
        );
    }
}
