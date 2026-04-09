<?php

namespace App\Sorts;

use Illuminate\Support\Str;
use Spatie\QueryBuilder\Sorts\Sort;

abstract class BaseSort implements Sort
{
    protected function getDirection(bool $descending): string
    {
        return $descending ? 'DESC' : 'ASC';
    }

    protected function getOrderByColumn(string $property): string
    {
        return Str::afterLast($property, '.');
    }

    protected function getMatchColumn(string $property): string
    {
        return Str::beforeLast($property, '.');
    }
}
