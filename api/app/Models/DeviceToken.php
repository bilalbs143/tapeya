<?php

namespace App\Models;

use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class DeviceToken extends BaseModel
{
    use DateFilterTrait;

    protected $fillable = [
        'user_id',
        'token',
        'platform',
        'app_version',
        'is_active',
        'last_seen_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_seen_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('user_id'),
            AllowedFilter::exact('platform'),
            AllowedFilter::exact('is_active'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'last_seen_at', 'created_at', 'updated_at'];
    }
}
