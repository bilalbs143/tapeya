<?php

namespace App\Utils\Traits\Model\Filters;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;

trait OperatorFilterTrait
{
    protected static function getCreatorModifierFilters(): array
    {
        return [
            AllowedFilter::exact('created_by'),
            AllowedFilter::exact('updated_by'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
            AllowedFilter::scope('created_between'),
            AllowedFilter::scope('updated_after'),
            AllowedFilter::scope('updated_before'),
            AllowedFilter::scope('updated_between'),
        ];
    }

    protected static function getCreatorModifierSorts(): array
    {
        return [
            'id',
            'created_at',
            'updated_at',
        ];
    }

    public function scopeByMe(Builder $query, string $column = 'created_by'): void
    {
        $query->where($column, auth()->id());
    }
}
