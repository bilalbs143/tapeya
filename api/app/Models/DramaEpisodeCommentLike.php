<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DramaEpisodeCommentLike extends Model
{
    protected $table = 'drama_episode_comment_likes';

    protected $fillable = ['comment_id', 'user_id'];

    public function comment(): BelongsTo
    {
        return $this->belongsTo(DramaEpisodeComment::class, 'comment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
