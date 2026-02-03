<?php

namespace App\Utils\Traits\Model\Filters;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;

trait OperatorFilterTrait
{
    protected static function getUserFilters()
    {
        return [
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('user.id'),
            'user.name',
            AllowedFilter::exact('user.username'),
            'user.phone',
            'user.memo',
            AllowedFilter::exact('user.status'),
            AllowedFilter::exact('user.bank_account.account_number'),
            AllowedFilter::exact('user.bank_account.account_holder'),
        ];
    }

    protected static function getCreatorModifierFilters()
    {
        return [
            AllowedFilter::exact('creator.id'),
            'creator.name',
            AllowedFilter::exact('creator.username'),
            'creator.phone',
            'creator.memo',
            AllowedFilter::exact('creator.status'),
            AllowedFilter::exact('creator.bank_account.account_number'),
            AllowedFilter::exact('creator.bank_account.account_holder'),
            AllowedFilter::exact('created_by'),
            AllowedFilter::exact('updated_by'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
            AllowedFilter::scope('updated_after'),
            AllowedFilter::scope('updated_before'),
        ];
    }

    protected static function getCreatorModifierSorts()
    {
        return [
            'id',
            'created_at',
            'updated_at',
        ];
    }

    public function scopeByMe(Builder $query, $column = 'created_by')
    {
        $query->where($column, auth()->id());
    }
}
