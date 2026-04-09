<?php

namespace App\Models;

use App\Utils\Traits\Model\BaseModelTrait;
use Illuminate\Database\Eloquent\Model;
use Spatie\QueryBuilder\AllowedFilter;

class StaticPage extends Model
{
    use BaseModelTrait;

    protected $fillable = [
        'title',
        'slug',
        'content',
    ];

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('slug'),
            AllowedFilter::partial('title'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'title',
            'slug',
            'created_at',
            'updated_at',
        ];
    }
}
