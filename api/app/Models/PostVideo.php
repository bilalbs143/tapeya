<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostVideo extends Model
{
    protected $table = 'post_videos';

    protected $fillable = [
        'post_id',
        'original_path',
        'processed_path',
        'hls_master_path',
        'playback_variants',
        'thumbnail_path',
        'preview_path',
        'duration_ms',
        'width',
        'height',
        'file_size_bytes',
        'processing_error',
        'ready_at',
        'abr_complete',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'playback_variants' => 'array',
            'duration_ms' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'file_size_bytes' => 'integer',
            'ready_at' => 'datetime',
            'abr_complete' => 'boolean',
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
