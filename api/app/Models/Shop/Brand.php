<?php

namespace App\Models\Shop;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class Brand extends BaseModel
{
    protected $table = 'shop_brands';

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'is_active',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'brand_id');
    }

    /**
     * @return array<int, string>
     */
    public static function getFilters(): array
    {
        return [
            'id',
            'name',
            'slug',
            AllowedFilter::exact('is_active'),
            AllowedFilter::callback('search', function (Builder $query, mixed $value): void {
                $term = '%'.addcslashes(mb_strtolower((string) $value), '%_\\').'%';
                $query->where(function (Builder $q) use ($term) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(slug) LIKE ?', [$term]);
                });
            }),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'name', 'slug', 'sort_order', 'created_at', 'updated_at'];
    }
}
