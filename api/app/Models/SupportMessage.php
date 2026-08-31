<?php

namespace App\Models;

use App\Enums\Support\SupportMessageStatusEnum;
use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class SupportMessage extends BaseModel
{
    use DateFilterTrait;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'message',
        'attachment_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => SupportMessageStatusEnum::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Free-search scope: submitter name/phone (digits), message body, or — for logged-in
     * submitters — the linked account's name/nickname (already eager-loaded via
     * `with('user:id,name,nickname')` in the controller's `baseQuery()`).
     */
    public function scopeSearch(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $digits = preg_replace('/\D/', '', $value);
        $phoneLike = $digits !== '' ? '%'.$digits.'%' : null;

        $query->where(function (Builder $q) use ($term, $phoneLike): void {
            $q->whereRaw('LOWER(name) LIKE ?', [$term])
                ->orWhereRaw('LOWER(message) LIKE ?', [$term])
                ->orWhereHas('user', function (Builder $u) use ($term): void {
                    $u->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw("LOWER(COALESCE(nickname, '')) LIKE ?", [$term]);
                });
            if ($phoneLike !== null) {
                $q->orWhereRaw("REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE ?", [$phoneLike]);
            }
        });
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::scope('search'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
            AllowedFilter::scope('created_between'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'created_at', 'status'];
    }
}
