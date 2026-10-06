<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DramaEpisodeLike extends Model
{
    protected $table = 'drama_episode_likes';

    protected $fillable = ['drama_episode_id', 'user_id'];

    public function episode(): BelongsTo
    {
        return $this->belongsTo(DramaEpisode::class, 'drama_episode_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
