<?php

namespace App\Models;

use App\Enums\Post\PostStatusEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\Post\PostVisibilityEnum;
use App\Services\Post\PostPlaybackUrlService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\QueryBuilder\AllowedFilter;

class Post extends BaseModel
{
    protected $table = 'posts';

    protected static function booted(): void
    {
        static::creating(function (Post $post) {
            if ($post->type === null) {
                $post->type = PostTypeEnum::Video;
            }
        });
    }

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'background_id',
        'status',
        'visibility',
        'repost_of_post_id',
        'cover_path',
        'likes_count',
        'comments_count',
        'views_count',
        'saves_count',
        'shares_count',
        'reposts_count',
        'reports_count',
        'published_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => PostTypeEnum::class,
            'status' => PostStatusEnum::class,
            'visibility' => PostVisibilityEnum::class,
            'likes_count' => 'integer',
            'comments_count' => 'integer',
            'views_count' => 'integer',
            'saves_count' => 'integer',
            'shares_count' => 'integer',
            'reposts_count' => 'integer',
            'reports_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->user();
    }

    public function video(): HasOne
    {
        return $this->hasOne(PostVideo::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(PostMedia::class)->orderBy('sort_order');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function saves(): HasMany
    {
        return $this->hasMany(PostSave::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    /**
     * Latest top-level comment for the compact feed preview.
     *
     * Replies are excluded because they lack context when shown by themselves.
     */
    public function latestComment(): HasOne
    {
        return $this->hasOne(PostComment::class)
            ->ofMany(
                ['id' => 'max'],
                fn (Builder $query) => $query->whereNull('parent_id')
            );
    }

    public function shares(): HasMany
    {
        return $this->hasMany(PostShare::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(PostReport::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(PostView::class);
    }

    public function hashtags(): BelongsToMany
    {
        return $this->belongsToMany(Hashtag::class, 'post_hashtag')->withTimestamps();
    }

    public function mentions(): HasMany
    {
        return $this->hasMany(PostMention::class);
    }

    public function repostOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'repost_of_post_id');
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(self::class, 'repost_of_post_id');
    }

    /** Public explore / Home Explore tab. */
    public function scopeExplore(Builder $query): Builder
    {
        return $query
            ->whereNotNull('published_at')
            ->where('visibility', PostVisibilityEnum::Public)
            ->whereNotIn('status', [
                PostStatusEnum::Uploading,
                PostStatusEnum::Failed,
                PostStatusEnum::Rejected,
                PostStatusEnum::Removed,
            ])
            ->withDiscoveryPoster();
    }

    /**
     * Following feed eligibility (authors already filtered to follow graph).
     * Public OR followers — does NOT force public-only (fixes reel following bug).
     */
    public function scopeFollowingFeed(Builder $query): Builder
    {
        return $query
            ->whereNotNull('published_at')
            ->whereIn('visibility', [
                PostVisibilityEnum::Public,
                PostVisibilityEnum::Followers,
            ])
            ->whereNotIn('status', [
                PostStatusEnum::Uploading,
                PostStatusEnum::Failed,
                PostStatusEnum::Rejected,
                PostStatusEnum::Removed,
            ])
            ->withDiscoveryPoster();
    }

    /**
     * Single source of truth: video posts need a non-empty poster AND HLS for
     * Home / reels discovery. Text/image/repost are unaffected. Owner "mine"
     * lists do not use this scope — they may stream the original while encoding.
     * Clients should not re-filter — rely on explore / followingFeed instead.
     *
     * @param  Builder<Post>  $query
     * @return Builder<Post>
     */
    public function scopeWithDiscoveryPoster(Builder $query): Builder
    {
        return $query->where(function (Builder $inner) {
            $inner->where('type', '!=', PostTypeEnum::Video)
                ->orWhere(function (Builder $discoverable) {
                    $discoverable
                        ->where(function (Builder $hasPoster) {
                            $hasPoster
                                ->where(function (Builder $cover) {
                                    $cover->whereNotNull('cover_path')->where('cover_path', '!=', '');
                                })
                                ->orWhereHas('video', function (Builder $video) {
                                    $video->whereNotNull('thumbnail_path')->where('thumbnail_path', '!=', '');
                                });
                        })
                        ->whereHas('video', function (Builder $video) {
                            $video->whereNotNull('hls_master_path')->where('hls_master_path', '!=', '');
                        });
                });
        });
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeVideosOnly(Builder $query): Builder
    {
        return $query->where('type', PostTypeEnum::Video);
    }

    public function thumbnailUrl(): ?string
    {
        return app(PostPlaybackUrlService::class)->posterUrl($this);
    }

    /**
     * @return array{type: string, url: string|null, hls_url: string|null, is_processed: bool}
     */
    public function playbackPayload(?int $viewerId = null): array
    {
        return app(PostPlaybackUrlService::class)->playbackPayload($this, $viewerId);
    }

    public function playbackUrl(?int $viewerId = null): ?string
    {
        return app(PostPlaybackUrlService::class)->playbackUrl($this, $viewerId);
    }

    public function isVideoProcessed(): bool
    {
        return app(PostPlaybackUrlService::class)->isProcessed($this);
    }

    public function originalUrl(): ?string
    {
        return app(PostPlaybackUrlService::class)->originalUrl($this);
    }

    public function hlsUrl(): ?string
    {
        return app(PostPlaybackUrlService::class)->hlsUrl($this);
    }

    public function ensureVideo(): PostVideo
    {
        $this->loadMissing('video');
        if ($this->video) {
            return $this->video;
        }

        return $this->video()->create([]);
    }

    public function videoRaw(string $column): mixed
    {
        $this->loadMissing('video');

        return $this->video?->getRawOriginal($column);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function fillVideo(array $attributes): PostVideo
    {
        $video = $this->ensureVideo();
        $video->forceFill($attributes)->save();
        $this->setRelation('video', $video);

        return $video;
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('visibility'),
            AllowedFilter::exact('type'),
            AllowedFilter::exact('user_id'),
            AllowedFilter::partial('body'),
            AllowedFilter::partial('caption', 'body'),
            AllowedFilter::exact('reports_count'),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return [
            'id',
            'published_at',
            'created_at',
            'likes_count',
            'views_count',
            'updated_at',
        ];
    }
}
