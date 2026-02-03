<?php

namespace App\Utils\Traits\Model\Filters;

use Illuminate\Database\Eloquent\Builder;

trait FilterTrait
{
    use DateFilterTrait;

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function scopeToday(Builder $query, string $column = 'created_at'): void
    {
        $query->whereDate($column, today());
    }
}
