<?php

namespace App\Models;

use App\Enums\Tournament\ReactionEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DramaEpisodeUserReaction extends Model
{
    protected $table = 'drama_episode_user_reactions';

    protected $fillable = ['drama_episode_id', 'user_id', 'reaction'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reaction' => ReactionEnum::class,
        ];
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(DramaEpisode::class, 'drama_episode_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
