<?php

namespace App\Models;

use App\Enums\Highlight\HighlightVideoSourceEnum;
use App\Support\Media\MediaDisk;
use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class Highlight extends BaseModel
{
    use DateFilterTrait;

    protected $table = 'highlights';

    protected $fillable = [
        'title',
        'description',
        'thumbnail',
        'video_source',
        'video',       // YouTube: embed URL string | Upload: storage path
        'duration',
        'tournament_id',
        'is_active',
        'views_count',
        'likes_count',
        'dislikes_count',
        'shares_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'video_source' => HighlightVideoSourceEnum::class,
            'is_active' => 'boolean',
            'views_count' => 'integer',
            'likes_count' => 'integer',
            'dislikes_count' => 'integer',
            'shares_count' => 'integer',
        ];
    }

    // ── Relations ──────────────────────────────────────────────────────────────

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(HighlightUserReaction::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Resolved thumbnail URL (storage URL or null).
     */
    public function thumbnailUrl(): ?string
    {
        $path = $this->getRawOriginal('thumbnail');

        return MediaDisk::url($path);
    }

    /**
     * Playable video URL for API consumers.
     * YouTube → the embed URL stored in the video column, returned as-is.
     * Upload  → storage URL resolved from the path stored in the video column.
     */
    public function resolvedVideoUrl(): ?string
    {
        $value = $this->getRawOriginal('video');

        if (! $value) {
            return null;
        }

        return match ($this->video_source ?? HighlightVideoSourceEnum::YOUTUBE) {
            HighlightVideoSourceEnum::UPLOAD => MediaDisk::url($value),
            default => $value,
        };
    }

    // ── QueryBuilder config ───────────────────────────────────────────────────

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::partial('title'),
            AllowedFilter::partial('search', 'title'), // alias: filter[search] → partial match on title
            AllowedFilter::exact('is_active'),
            AllowedFilter::exact('tournament_id'),
            AllowedFilter::scope('created_between'),
            AllowedFilter::scope('created_after'),
            AllowedFilter::scope('created_before'),
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
            'views_count',
            'likes_count',
            'created_at',
            'updated_at',
        ];
    }
}
