<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\Streaming\StreamOrientationEnum;
use App\Enums\Tournament\TournamentTypeEnum;
use App\Streaming\Support\StreamUrlPlayback;
use App\Streaming\Support\YouTubeEmbedUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\QueryBuilder\AllowedFilter;

class MatchStream extends BaseModel
{
    protected $fillable = [
        'match_id',
        'owner_user_id',
        'title',
        'description',
        'orientation',
        'streaming_url',
        'stream_thumbnail',
        'provider',
        'status',
        'created_by',
        'provider_stream_id',
        'provider_ingest_id',
        'provider_playback_id',
        'provider_recording_id',
        'ingest_rtmp_url',
        'stream_key_encrypted',
        'playback_url',
        'embed_url',
        'provider_metadata',
        'started_at',
        'ended_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'orientation' => StreamOrientationEnum::class,
            'provider_metadata' => 'array',
            'stream_thumbnail' => AsFile::class.':match-stream-thumbnails,false,media',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function isStandalone(): bool
    {
        return $this->match_id === null;
    }

    /**
     * Self-serve mobile broadcast — created by a regular user via LiveBroadcastController,
     * not by admin/backoffice. Distinct from isStandalone(): every self-serve stream is
     * standalone, but not every standalone stream is self-serve (see LIVE_STREAM_MOBILE_BROADCAST.md).
     */
    public function isSelfServe(): bool
    {
        return $this->owner_user_id !== null;
    }

    /**
     * Normalize Go Live aspect (API string, enum, or junk → enum).
     *
     * @see docs/LIVE_STREAM_ORIENTATION.md
     */
    public static function normalizeOrientation(mixed $value): StreamOrientationEnum
    {
        return StreamOrientationEnum::normalize($value);
    }

    /**
     * Encode / viewer aspect for self-serve Go Live (API string value).
     * Column wins; provider_metadata.orientation is a fallback for spike/manual rows.
     *
     * @see docs/LIVE_STREAM_ORIENTATION.md
     */
    public function resolvedOrientation(): string
    {
        if ($this->orientation instanceof StreamOrientationEnum) {
            return $this->orientation->value;
        }

        $fallback = $this->provider_metadata['orientation'] ?? null;

        return StreamOrientationEnum::normalize($fallback)->value;
    }

    /**
     * Standalone URL-based stream (no YouTube provider row).
     */
    public function isExternalPlayback(): bool
    {
        return $this->isStandalone() && filled($this->streaming_url);
    }

    public function displayTitle(): string
    {
        if (filled($this->title)) {
            return $this->title;
        }

        $match = $this->relationLoaded('match') ? $this->match : $this->match()->with(['homeTeam', 'awayTeam'])->first();

        if ($match?->homeTeam && $match?->awayTeam) {
            return "{$match->homeTeam->name} vs {$match->awayTeam->name}";
        }

        return 'Live Stream';
    }

    public function displayDescription(): ?string
    {
        if (filled($this->description)) {
            return $this->description;
        }

        $match = $this->relationLoaded('match') ? $this->match : $this->match()->with('tournament')->first();

        return $match?->tournament?->tournament_name;
    }

    public function thumbnailUrl(): ?string
    {
        if ($this->getRawOriginal('stream_thumbnail')) {
            return $this->stream_thumbnail;
        }

        if ($this->match_id && $this->relationLoaded('match') && $this->match) {
            return $this->match->streamThumbnailUrl();
        }

        if ($this->match_id) {
            $this->loadMissing('match.stream');

            return $this->match?->streamThumbnailUrl();
        }

        return null;
    }

    /**
     * Client-safe playback payload for list + viewer endpoints.
     *
     * @return array<string, mixed>|null
     */
    public function playbackForApp(): ?array
    {
        if (! in_array($this->status, ['live', 'ended'], true)) {
            return null;
        }

        if ($this->isStandalone() && filled($this->streaming_url)) {
            return StreamUrlPlayback::resolve($this->streaming_url);
        }

        if ($this->embed_url || $this->provider_playback_id) {
            return [
                'mode' => 'iframe',
                'embed_id' => $this->provider_playback_id,
                'embed_url' => YouTubeEmbedUrl::normalize($this->embed_url, $this->provider_playback_id),
            ];
        }

        if (filled($this->playback_url)) {
            return [
                'mode' => 'hls',
                'url' => $this->playback_url,
            ];
        }

        if (filled($this->streaming_url)) {
            return StreamUrlPlayback::resolve($this->streaming_url);
        }

        return null;
    }

    /**
     * Admin/backoffice monitor payload — includes starting streams when a YouTube embed exists.
     *
     * @return array<string, mixed>|null
     */
    public function playbackForMonitor(): ?array
    {
        if ($this->status === 'starting' && ($this->embed_url || $this->provider_playback_id)) {
            return [
                'mode' => 'iframe',
                'embed_id' => $this->provider_playback_id,
                'embed_url' => YouTubeEmbedUrl::normalize($this->embed_url, $this->provider_playback_id),
            ];
        }

        return $this->playbackForApp();
    }

    public function scopeVisibleInApp(Builder $query): void
    {
        $query->whereIn('status', ['live', 'starting'])
            ->where(function (Builder $q) {
                $q->whereNull('match_id')
                    ->orWhereHas('match.tournament', fn ($t) => $t->where('tournament_type', TournamentTypeEnum::OPEN_TOURNAMENT));
            });
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('status'),
            AllowedFilter::exact('provider'),
            AllowedFilter::exact('owner_user_id'),
            AllowedFilter::callback('self_serve', function ($query, $value) {
                $query->when((bool) $value, fn ($q) => $q->whereNotNull('owner_user_id'), fn ($q) => $q->whereNull('owner_user_id'));
            }),
            AllowedFilter::callback('search', function ($query, $value) {
                $term = '%'.addcslashes(mb_strtolower((string) $value), '%_\\').'%';
                $query->whereRaw('LOWER(title) LIKE ?', [$term]);
            }),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'status', 'provider', 'started_at', 'created_at'];
    }
}
