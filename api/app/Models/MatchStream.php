<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchStream extends Model
{
    protected $fillable = [
        'match_id',
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
            'provider_metadata' => 'array',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }
}
