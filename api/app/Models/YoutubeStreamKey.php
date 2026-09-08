<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\QueryBuilder\AllowedFilter;

/**
 * Reusable YouTube RTMP ingest — one key per encoder, bound to many broadcasts.
 * Reserved for any non-ended session that references it (including recoverable idle).
 */
class YoutubeStreamKey extends BaseModel
{
    protected $table = 'youtube_stream_keys';

    protected $fillable = [
        'title',
        'youtube_stream_id',
        'ingest_rtmp_url',
        'stream_key_encrypted',
        'is_active',
        'created_by',
    ];

    protected $hidden = [
        'stream_key_encrypted',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function liveStreams(): HasMany
    {
        return $this->hasMany(LiveStream::class);
    }

    /** Non-ended session holding this key, if any (live / starting / idle setup). */
    public function activeSession(): ?LiveStream
    {
        return $this->liveStreams()
            ->whereNotIn('status', ['ended', 'error'])
            ->orderByRaw("CASE status WHEN 'live' THEN 0 WHEN 'starting' THEN 1 ELSE 2 END")
            ->first();
    }

    public function isInUse(?int $excludingStreamId = null): bool
    {
        return $this->liveStreams()
            ->whereNotIn('status', ['ended', 'error'])
            ->when($excludingStreamId, fn ($q) => $q->where('id', '!=', $excludingStreamId))
            ->exists();
    }

    /**
     * @return array<int, string|AllowedFilter>
     */
    public static function getFilters(): array
    {
        return [
            AllowedFilter::exact('is_active'),
            AllowedFilter::partial('search', 'title'),
            AllowedFilter::callback('in_use', function ($query, $value) {
                $wantInUse = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($wantInUse === null) {
                    if ($value === '1' || $value === 1) {
                        $wantInUse = true;
                    } elseif ($value === '0' || $value === 0) {
                        $wantInUse = false;
                    } else {
                        return;
                    }
                }

                $activeSession = fn ($q) => $q->whereNotIn('status', ['ended', 'error']);

                if ($wantInUse) {
                    $query->whereHas('liveStreams', $activeSession);
                } else {
                    $query->whereDoesntHave('liveStreams', $activeSession);
                }
            }),
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function getSorts(): array
    {
        return ['id', 'title', 'created_at'];
    }
}
