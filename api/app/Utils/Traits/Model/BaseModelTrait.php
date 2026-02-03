<?php

namespace App\Utils\Traits\Model;

use App\Utils\Constants\ApiConstants;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\AllowedFilter;

trait BaseModelTrait
{
    public function scopePagination(Builder $query)
    {
        return $query
            ->paginate(ApiConstants::perPage())
            ->appends(request()->query());
    }

    /**
     * Override in model: return list of filter names or AllowedFilter instances.
     *
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return ['id'];
    }

    /**
     * Override in model: return list of sortable columns.
     *
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'created_at', 'updated_at'];
    }
}
