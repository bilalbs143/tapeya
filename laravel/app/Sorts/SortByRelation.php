<?php

namespace App\Sorts;

use Illuminate\Database\Eloquent\Builder;

class SortByRelation extends BaseSort
{
    public function __construct(public $model) {}

    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $model = app($this->model);
        $tableName = $model->getTable();

        $query->orderBy(
            $this->model::select($this->getOrderByColumn($property))->whereColumn("{$tableName}.id", "{$query->from}.{$this->getMatchColumn($property)}"),
            $this->getDirection($descending)
        );
    }
}
