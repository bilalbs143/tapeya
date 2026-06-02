<?php

namespace App\Models;

use App\Enums\Tournament\ReactionEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HighlightUserReaction extends Model
{
    protected $table = 'highlight_user_reactions';

    protected $fillable = ['highlight_id', 'user_id', 'reaction'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reaction' => ReactionEnum::class,
        ];
    }

    public function highlight(): BelongsTo
    {
        return $this->belongsTo(Highlight::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
