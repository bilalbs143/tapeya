<?php

namespace App\Models;

use App\Enums\Drama\DramaVideoSourceEnum;
use App\Support\Media\MediaDisk;
use App\Utils\Traits\Model\Filters\DateFilterTrait;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

class DramaEpisode extends BaseModel
{
    use DateFilterTrait;

    protected $table = 'drama_episodes';

    protected $fillable = [
        'drama_serial_id',
        'episode_number',
        'title',
        'description',
        'thumbnail',
        'video_source',
        'video',
        'duration',
        'is_active',
        'views_count',
        'likes_count',
        'dislikes_count',
        'comments_count',
        'shares_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'video_source' => DramaVideoSourceEnum::class,
            'is_active' => 'boolean',
            'episode_number' => 'integer',
            'views_count' => 'integer',
            'likes_count' => 'integer',
            'dislikes_count' => 'integer',
            'comments_count' => 'integer',
            'shares_count' => 'integer',
        ];
    }

    public function serial(): BelongsTo
    {
        return $this->belongsTo(DramaSerial::class, 'drama_serial_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(DramaEpisodeLike::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(DramaEpisodeUserReaction::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(DramaEpisodeComment::class);
    }

    public function thumbnailUrl(): ?string
    {
        return MediaDisk::url($this->getRawOriginal('thumbnail'));
    }

    public function resolvedVideoUrl(): ?string
    {
        $value = $this->getRawOriginal('video');

        if (! $value) {
            return null;
        }

        return match ($this->video_source ?? DramaVideoSourceEnum::YOUTUBE) {
            DramaVideoSourceEnum::UPLOAD => MediaDisk::url($value),
            default => $value,
        };
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::partial('title'),
            AllowedFilter::partial('search', 'title'),
            AllowedFilter::exact('is_active'),
            AllowedFilter::exact('drama_serial_id'),
            AllowedFilter::exact('episode_number'),
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
            'episode_number',
            'title',
            'views_count',
            'likes_count',
            'created_at',
            'updated_at',
        ];
    }
}
