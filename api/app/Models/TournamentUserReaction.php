<?php

namespace App\Models;

use App\Enums\Tournament\ReactionEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentUserReaction extends Model
{
    protected $table = 'tournament_user_reactions';

    protected $fillable = ['user_id', 'tournament_id', 'reaction'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reaction' => ReactionEnum::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }
}
