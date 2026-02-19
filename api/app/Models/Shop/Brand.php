<?php

namespace App\Models\Shop;

use App\Models\BaseModel;
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
        return ['id', 'name', 'slug', AllowedFilter::exact('is_active')];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'name', 'slug', 'sort_order', 'created_at', 'updated_at'];
    }
}
