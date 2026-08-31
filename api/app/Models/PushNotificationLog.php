<?php

namespace App\Models;

use App\Enums\Push\PushNotificationStatusEnum;
use App\Enums\Push\PushTargetTypeEnum;
use App\Enums\Push\PushTriggeredByEnum;
use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class PushNotificationLog extends BaseModel
{
    use DateFilterTrait;

    protected $fillable = [
        'template_key',
        'title',
        'body',
        'data',
        'image_url',
        'target_type',
        'target_user_id',
        'triggered_by',
        'sent_by_user_id',
        'status',
        'total_tokens',
        'success_count',
        'failure_count',
        'provider',
        'error_message',
        'queued_at',
        'sent_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
            'target_type' => PushTargetTypeEnum::class,
            'triggered_by' => PushTriggeredByEnum::class,
            'status' => PushNotificationStatusEnum::class,
            'total_tokens' => 'integer',
            'success_count' => 'integer',
            'failure_count' => 'integer',
            'queued_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function sentByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by_user_id');
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('triggered_by'),
            AllowedFilter::exact('target_type'),
            AllowedFilter::exact('target_user_id'),
            AllowedFilter::scope('search'),
            AllowedFilter::scope('created_between'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
        ];
    }

    /** Free-search scope: notification title OR body. */
    public function scopeSearch(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $query->where(function (Builder $q) use ($term): void {
            $q->whereRaw('LOWER(title) LIKE ?', [$term])
                ->orWhereRaw("LOWER(COALESCE(body, '')) LIKE ?", [$term]);
        });
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'status', 'created_at', 'sent_at', 'success_count', 'failure_count'];
    }
}
