<?php

namespace App\Models;

use App\Enums\Post\PostReportReasonEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostReport extends Model
{
    protected $table = 'post_reports';

    protected $fillable = [
        'post_id',
        'reporter_id',
        'reason',
        'details',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reason' => PostReportReasonEnum::class,
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Free-search scope: reported post's body, OR the reporter's name/nickname
     * (both relations already eager-loaded via the controller's `baseQuery()`).
     */
    public function scopeSearch(Builder $query, ?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }
        $term = '%'.addcslashes(mb_strtolower($value), '%_\\').'%';
        $query->where(function (Builder $q) use ($term): void {
            $q->whereHas('post', function (Builder $p) use ($term): void {
                $p->whereRaw('LOWER(body) LIKE ?', [$term]);
            })->orWhereHas('reporter', function (Builder $r) use ($term): void {
                $r->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw("LOWER(COALESCE(nickname, '')) LIKE ?", [$term]);
            });
        });
    }
}
