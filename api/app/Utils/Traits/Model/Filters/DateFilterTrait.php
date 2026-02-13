<?php

namespace App\Utils\Traits\Model\Filters;

use Illuminate\Database\Eloquent\Builder;

trait DateFilterTrait
{
    public function scopeDateFilter(Builder $query, string $column, string $date, string $operator = '='): void
    {
        $query->whereDate($column, $operator, $date);
    }

    public function scopeCreatedBetween(Builder $query, ?string $from, ?string $to): void
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
    }

    public function scopeCreatedAfter(Builder $query, ?string $date): void
    {
        if ($date) {
            $query->whereDate('created_at', '>=', $date);
        }
    }

    public function scopeCreatedBefore(Builder $query, ?string $date): void
    {
        if ($date) {
            $query->whereDate('created_at', '<=', $date);
        }
    }

    public function scopeUpdatedBetween(Builder $query, ?string $from, ?string $to): void
    {
        if ($from) {
            $query->whereDate('updated_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('updated_at', '<=', $to);
        }
    }
}
